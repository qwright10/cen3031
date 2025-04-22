import { requireUser } from '@/session';
import { db } from '@/db';
import Link from 'next/link';
import React from 'react';

export default async function Home() {
  const user = await requireUser();

  const quizzes = await db
    .selectFrom('quiz')
    .select(['quiz.id', 'quiz.name', 'quiz.is_private', 'quiz.created_at'])
    .innerJoin('question', 'question.quiz_id', 'quiz.id')
    .select(eb => [
      eb.fn.count('question.id')
        .$castTo<number>()
        .as('question_count'),
      eb.selectFrom('scored_quiz_attempt')
        .select('score')
        .where('scored_quiz_attempt.account_id', '=', user.id)
        .whereRef('scored_quiz_attempt.quiz_id', '=', 'quiz.id')
        .orderBy('score desc')
        .limit(1)
        .as('best_attempt_score'),
      eb.selectFrom('scored_quiz_attempt')
        .select('score')
        .where('scored_quiz_attempt.account_id', '=', user.id)
        .whereRef('scored_quiz_attempt.quiz_id', '=', 'quiz.id')
        .orderBy('timestamp desc')
        .limit(1)
        .as('last_attempt_score'),
      eb.selectFrom('account')
        .select('username')
        .whereRef('account.id', '=', 'quiz.owner_id')
        .as('owner_username'),
    ])
    .groupBy('quiz.id')
    .where(eb => eb.or([
      eb('quiz.is_private', '=', false),
      eb('quiz.owner_id', '=', user.id),
    ]))
    .orderBy('created_at desc')
    .execute();

  return (
    <div className="max-w-screen-lg mx-auto px-6 pb-6">
      <div className="mt-10 px-4 space-y-8">
        <div className="">

        </div>

        <div className="grid grid-cols-[auto_auto_auto_min-content]">
          {!!quizzes.length && (
            <div className="grid grid-cols-subgrid items-end px-4 col-span-full font-medium mb-4">
              <h3>Quiz Name</h3>

              <h3>Creator</h3>

              <h3>Questions</h3>

              <h3 className="text-right">PB&nbsp;/&nbsp;Last</h3>
            </div>
          )}

          {quizzes.map(quiz => (
            <div className="grid grid-cols-subgrid items-center px-4 col-span-full h-12 even:bg-slate-800 rounded-md" key={quiz.id}>
              <Link
                href={`/quiz/${quiz.id}`}
                className="font-semibold">
                {quiz.name}
              </Link>

              <Link
                href={`/user/${quiz.owner_username ?? ''}`}
                className="text-cyan-500">{quiz.owner_username}</Link>

              <p className="text-sm">
                {quiz.question_count} question{quiz.question_count === 1 ? '' : 's'}
              </p>

              <p className="text-right">
                <span className="font-semibold">{quiz.best_attempt_score !== null ? Number(quiz.best_attempt_score).toFixed(2) : '--'}</span>
              &nbsp;/&nbsp;{quiz.last_attempt_score !== null ? Number(quiz.last_attempt_score).toFixed(2) : '--'}
              </p>
            </div>
          ))}

          {!quizzes.length && (
            <p className="space-x-2">
              <span>There's nothing to see here :(</span>
              <Link href="/create" className="text-cyan-500 underline underline-offset-2">Go make a quiz!</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
