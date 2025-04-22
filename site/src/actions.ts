'use server';

import 'server-only';
import { db, Question } from '@/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import sha1 from 'sha1';
import { DatabaseError } from 'pg';

import { TempQuestion } from '@/app/create/types';
import { requireUser } from '@/session';
import { z } from 'zod';

export interface CreateQuizOptions {
  questions: TempQuestion[];
  title: string;
  visibility: string;
}

/**
 * The reason a submitted quiz failed validation
 */
export type CreateQuizValidation = { s: 'invalid_title' }
  | { s: 'missing_prompt', q: number }
  | { s: 'missing_options', q: number }
  | { s: 'missing_answer', q: number }
  | { s: 'unknown' };

/**
 * Server action validating and creating a new quiz
 * @param options
 */
export async function createQuiz(options: CreateQuizOptions): Promise<CreateQuizValidation> {
  const user = await requireUser();

  const trimmedTitle = options.title.trim();

  // title length must be between 1 and 128
  if (trimmedTitle.length < 1 || trimmedTitle.length > 128) {
    return { s: 'invalid_title' };
  }

  // quiz must contain one question (UI-enforced)
  if (options.questions.length < 1) {
    return { s: 'unknown' };
  }

  // array of TempQuestions transformed for insertion
  const transformed = Array<Omit<Question, 'id' | 'quiz_id'>>();

  // visibility can either be 'public' or 'private'
  if (!['public', 'private'].includes(options.visibility)) {
    return { s: 'unknown' };
  }

  // iterate over temp questions
  for (let i = 0; i < options.questions.length; i++) {
    const question = options.questions[i];

    // multiple choice and multiple select questions must have at least one non-empty option
    if (question.type !== 'true_false' && question.options.every(o => !o.value.trim())) {
      return { s: 'missing_options', q: i };
    }

    const trimmedPrompt = question.prompt.trim();
    // prompt must not be empty
    if (!trimmedPrompt) {
      return { s: 'missing_prompt', q: i };
    }

    // temporary transformed question
    const q = {
      type: question.type,
      prompt: trimmedPrompt,
      choices: <string[] | null>[],
      answers: <number[]>[],
    };

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      // iterate over options
      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];


        if (question.type === 'multiple_choice') {
          // add trimmed option value
          q.choices?.push(option.value.trim());
        } else {
          // true/false questions don't have choices
          q.choices = null;
        }

        if (option.correct) {
          // multiple-hoice and true/false can only have one correct answer
          if (q.answers.length) {
            return { s: 'unknown' };
          }

          // push index of correct option
          q.answers.push(j);
        }
      }

      transformed.push(q);
    } else {
      // iterate over options
      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        // add trimmed option value
        q.choices?.push(option.value.trim());

        if (option.correct) {
          // push index of correct option
          q.answers.push(j);
        }
      }

      transformed.push(q);
    }
  }

  const id = await db
    .transaction()
    .execute(async trx => {
      // create quiz, initially without questions
      const { id } = await trx
        .insertInto('quiz')
        .values({
          owner_id: user.id,
          name: trimmedTitle,
          is_private: options.visibility === 'private',
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      // add questions to quiz
      await trx
        .insertInto('question')
        .values(
          transformed.map(t => ({ ...t, quiz_id: id })),
        )
        .execute();

      return id;
    });

  // redirect user to newly-created quiz
  redirect(`/quiz/${id}`);
}

// zod schema to validate quiz attempt form data
const submissionSchema =
  z.record(
    z.string(),
    z.union([
      z.literal(''),
      z.string().uuid(),
      z.literal('on'),
      z.string().regex(/^\d+$/),
      z.array(z.string().regex(/^\d+$/)),
    ]),
  );

/**
 * Server action validating and storing a new quiz attempt
 * @param formData
 */
export async function submitQuiz(formData: FormData) {
  const user = await requireUser();

  // transform form data (k => v,v,v) into object (k => v[])
  const data = Object.fromEntries(
    [...new Set(formData.keys())]
      .map(k => {
        const e = formData.getAll(k);
        if (e.length !== 1) return [k, e];
        return [k, e[0]];
      }),
  );

  const validation = await submissionSchema.safeParseAsync(data);

  // attempt failed validation
  if (!validation.success) {
    notFound();
  }

  const quizId = validation.data['quiz_id'];
  if (typeof quizId !== 'string') notFound();

  // select quiz with questions
  const quiz = await db
    .selectFrom('quiz')
    .selectAll()
    .select(eb =>
      jsonArrayFrom(
        eb.selectFrom('question')
          .selectAll()
          .whereRef('question.quiz_id', '=', 'quiz.id'),
      )
        .as('questions'))
    .where(eb => eb.and([
      eb('id', '=', quizId),
      eb.or([
        eb('is_private', '=', false),
        eb('owner_id', '=', user.id),
      ]),
    ]))
    .executeTakeFirst()
    .catch(() => notFound());

  // quiz doesn't exist or user doesn't have access
  if (!quiz) notFound();

  const attemptId = await db
    .transaction()
    .execute(async trx => {
      // create new empty quiz attempt
      const { id: attemptId } = await trx
        .insertInto('quiz_attempt')
        .values({
          quiz_id: quizId,
          account_id: user.id,
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      // array of question attempts prepared for insertion
      const questionAttempts = <{ id: string; response: number[] }[]>[];
      for (const question of quiz.questions) {
        // if user provided response *or* false is selected
        const response = question.id in validation.data
          ? validation.data[question.id]
          : [];

        if (response === 'on') {
          // true is selected
          questionAttempts.push({ id: question.id, response: [0] });
        } else if (question.type === 'true_false') {
          // false is selected
          questionAttempts.push({ id: question.id, response: [1] });
        } else {
          // parse stringified int (maybe array) to int array
          questionAttempts.push({
            id: question.id,
            response: (Array.isArray(response) ? response : [response])
              .map(r => Number(r))
              .filter(n => !Number.isNaN(n)),
          });
        }
      }

      // add questions attempts to quiz attempt
      await trx
        .insertInto('question_attempt')
        .values(
          questionAttempts.map(attempt => ({
            attempt_id: attemptId,
            question_id: attempt.id,
            response: attempt.response,
          })),
        )
        .executeTakeFirstOrThrow();

      return attemptId;
    });

  // redirect user to new attempt
  redirect(`/quiz/${quizId}/attempt/${String(attemptId)}`);
}

/*function generateChallenge(username?: string, password?: string, emailHash?: string, userId?: string) {
  return db
    .insertInto('challenge')
    .values({
      username,
      password,
      email_hash: emailHash,
      user_id: userId,
    })
    .returningAll();
}*/

/**
 * Signs a JWT session secret for the user
 * @param userId
 */
function signToken(userId: string) {
  return sign({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60),
  }, Buffer.from(jwtSecret, 'base64'));
}

/**
 * Result of registration request
 */
export type RegisterResult = 'invalid_username' | 'invalid_password' | 'conflict' | 'success' | 'unknown';

/**
 * Attempts to register the user with provided credentials
 * @param username requested username
 * @param password requested password
 * @param email requested email, if any
 */
export async function register(username: string, password: string, email?: string): Promise<RegisterResult> {
  // username is 4-24 characters including A-Z, a-z, 0-9, and hyphen
  if (!username.match(/^[A-Za-z0-9-]{4,24}$/)) return 'invalid_username';
  // password is at least 8 characters long
  if (!password.match(/^.{8,}$/)) return 'invalid_password';

  let user;
  try {
    // attempt to create user
    user = await db
      .insertInto('account')
      .values({
        username,
        email_hash: email ? sha1(email) : null,
        password: await hash(password, 10),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  } catch (e) {
    // unique/PK constraint violation (username or email already exist)
    if (e instanceof DatabaseError && e.code === '23505') {
      return 'conflict';
    }

    // another error occurred
    return 'unknown';
  }

  // set cookie on client
  const c = await cookies();
  c.set('__session', signToken(user.id));

  // redirect user to home page
  redirect('/');
}

/**
 * Result of login request
 */
export type LoginResult = 'not_found' | 'no_password' | 'incorrect_password' | 'success' | 'unknown';

// secret used to sign JWT session secrets
const jwtSecret = String(process.env['JWT_SECRET']);

/**
 * Attempts to login the user in with provided credentials
 * @param username
 * @param password
 */
export async function login(username: string, password: string): Promise<LoginResult> {
  // find user with provided username
  const user = await db
    .selectFrom('account')
    .selectAll()
    .where('username', '=', username)
    .executeTakeFirst();

  // user doesn't exist
  if (!user) return 'not_found';
  // user doesn't have a password (requires passkey)
  if (!user.password) return 'no_password';

  // check if provided password matches hashed password
  const passwordMatches = await compare(password, user.password);
  if (!passwordMatches) return 'incorrect_password';

  // set cookie on client
  const c = await cookies();
  c.set('__session', signToken(user.id));

  // login successful
  return 'success';
}
