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

export type CreateQuizValidation = { s: 'invalid_title' }
  | { s: 'missing_prompt', q: number }
  | { s: 'missing_options', q: number }
  | { s: 'missing_answer', q: number }
  | { s: 'unknown' };

export async function createQuiz(options: CreateQuizOptions): Promise<CreateQuizValidation> {
  const user = await requireUser();

  const trimmedTitle = options.title.trim();

  if (trimmedTitle.length < 1 || trimmedTitle.length > 128) {
    return { s: 'invalid_title' };
  }

  if (options.questions.length < 1) {
    return { s: 'unknown' };
  }

  const transformed = Array<Omit<Question, 'id' | 'quiz_id'>>();

  if (!['public', 'private'].includes(options.visibility)) {
    return { s: 'unknown' };
  }

  for (let i = 0; i < options.questions.length; i++) {
    const question = options.questions[i];

    if (question.type !== 'true_false' && question.options.every(o => !o.value.trim())) {
      return { s: 'missing_options', q: i };
    }

    const trimmedPrompt = question.prompt.trim();
    if (!trimmedPrompt) {
      return { s: 'missing_prompt', q: i };
    }

    const q = {
      type: question.type,
      prompt: trimmedPrompt,
      choices: <string[] | null>[],
      answers: <number[]>[],
    };

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        if (question.type === 'multiple_choice') {
          q.choices?.push(option.value.trim());
        } else {
          q.choices = null;
        }

        if (option.correct) {
          if (q.answers.length) {
            return { s: 'unknown' };
          }

          q.answers.push(j);
        }
      }

      transformed.push(q);
    } else {
      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        q.choices?.push(option.value.trim());

        if (option.correct) {
          q.answers.push(j);
        }
      }

      transformed.push(q);
    }
  }

  const id = await db
    .transaction()
    .execute(async trx => {
      const { id } = await trx
        .insertInto('quiz')
        .values({
          owner_id: user.id,
          name: trimmedTitle,
          is_private: options.visibility === 'private',
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      await trx
        .insertInto('question')
        .values(
          transformed.map(t => ({ ...t, quiz_id: id })),
        )
        .execute();

      return id;
    });

  redirect(`/quiz/${id}`);
}

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

export async function submitQuiz(formData: FormData) {
  const user = await requireUser();

  const data = Object.fromEntries(
    [...new Set(formData.keys())]
      .map(k => {
        const e = formData.getAll(k);
        if (e.length !== 1) return [k, e];
        return [k, e[0]];
      }),
  );

  const validation = await submissionSchema.safeParseAsync(data);

  if (!validation.success) {
    notFound();
  }

  const quizId = validation.data['quiz_id'];
  if (typeof quizId !== 'string') notFound();

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

  if (!quiz) notFound();

  const attemptId = await db
    .transaction()
    .execute(async trx => {
      const { id: attemptId } = await trx
        .insertInto('quiz_attempt')
        .values({
          quiz_id: quizId,
          account_id: user.id,
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      const questionAttempts = <{ id: string; response: number[] }[]>[];
      for (const question of quiz.questions) {
        const response = question.id in validation.data
          ? validation.data[question.id]
          : [];

        if (response === 'on') {
          questionAttempts.push({ id: question.id, response: [0] });
        } else if (question.type === 'true_false') {
          questionAttempts.push({ id: question.id, response: [1] });
        } else {
          questionAttempts.push({
            id: question.id,
            response: (Array.isArray(response) ? response : [response])
              .map(r => Number(r))
              .filter(n => !Number.isNaN(n)),
          });
        }
      }

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

function signToken(userId: string) {
  return sign({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60),
  }, Buffer.from(jwtSecret, 'base64'));
}

export type RegisterResult = 'invalid_username' | 'invalid_password' | 'conflict' | 'success' | 'unknown';

export async function register(username: string, password: string, email?: string): Promise<RegisterResult> {
  if (!username.match(/^[A-Za-z0-9-]{4,24}$/)) return 'invalid_username';
  if (!password.match(/^.{8,}$/)) return 'invalid_password';

  let user;
  try {
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
    if (e instanceof DatabaseError && e.code === '23505') {
      return 'conflict';
    }

    return 'unknown';
  }

  const c = await cookies();
  c.set('__session', signToken(user.id));

  redirect('/');
}

export type LoginResult = 'not_found' | 'no_password' | 'incorrect_password' | 'success' | 'unknown';

const jwtSecret = String(process.env['JWT_SECRET']);

export async function login(username: string, password: string): Promise<LoginResult> {
  const user = await db
    .selectFrom('account')
    .selectAll()
    .where('username', '=', username)
    .executeTakeFirst();

  if (!user) return 'not_found';
  if (!user.password) return 'no_password';

  const passwordMatches = await compare(password, user.password);
  if (!passwordMatches) return 'incorrect_password';

  const c = await cookies();
  c.set('__session', signToken(user.id));

  return 'success';
}

/*
export async function userCredentials(username: string) {
  return db
    .selectFrom('account')
    .select('account.id')
    .select(eb =>
      jsonArrayFrom(
        eb.selectFrom('credential')
          .select(['id', 'jwt'])
          .whereRef('credential.user_id', '=', 'account.id'),
      )
        .as('credentials'))
    .where('username', '=', username)
    .executeTakeFirst();
} */
