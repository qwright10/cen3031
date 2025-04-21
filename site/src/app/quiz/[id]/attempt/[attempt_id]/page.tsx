import { requireUser } from '@/session';
import { db, Question } from '@/db';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { notFound } from 'next/navigation';
import ms from 'ms';
import Link from 'next/link';
import { QuestionEntry } from '@/app/quiz/[id]/attempt/[attempt_id]/question-entry';
import { QuestionAttempt } from '@/db/schema';

interface AttemptResultsProps {
  params: Promise<{ attempt_id: string }>;
}

export default async function AttemptResults({ params }: AttemptResultsProps) {
  const { attempt_id } = await params;
  const user = await requireUser();

  const attemptId = Number(attempt_id);
  if (Number.isNaN(attemptId)) notFound();

  const attemptScore = await db
    .selectFrom('scored_quiz_attempt')
    .select('score')
    .where('scored_quiz_attempt.id', '=', attemptId)
    .where('scored_quiz_attempt.account_id', '=', user.id)
    .executeTakeFirst();

  if (!attemptScore) notFound();

  const attempt = await db
    .selectFrom('quiz_attempt')
    .select(eb => [
      jsonArrayFrom(
        eb.selectFrom('question_attempt')
          .innerJoin('question', 'question.id', 'question_attempt.question_id')
          .selectAll()
          .whereRef('question_attempt.attempt_id', '=', 'quiz_attempt.id')
          .$castTo<Question & QuestionAttempt>(),
      )
        .as('questions'),
      jsonObjectFrom(
        eb.selectFrom('quiz')
          .selectAll()
          .whereRef('quiz.id', '=', 'quiz_attempt.quiz_id'),
      )
        .$notNull()
        .as('quiz'),

      jsonObjectFrom(
        eb.selectFrom('scored_quiz_attempt')
          .select(['id', 'score', 'timestamp'])
          .whereRef('scored_quiz_attempt.quiz_id', '=', 'quiz_attempt.quiz_id')
          .whereRef('scored_quiz_attempt.id', '<>', 'quiz_attempt.id')
          .whereRef('scored_quiz_attempt.account_id', '=', 'quiz_attempt.account_id')
          .whereRef('scored_quiz_attempt.timestamp', '<=', 'quiz_attempt.timestamp')
          .orderBy('timestamp desc')
          .limit(1),
      )
        .as('previous_attempt'),
    ])
    .innerJoin('scored_quiz_attempt', 'scored_quiz_attempt.id', 'quiz_attempt.id')
    .selectAll('quiz_attempt')
    .select('scored_quiz_attempt.score')
    .where('quiz_attempt.id', '=', attemptId)
    .where('quiz_attempt.account_id', '=', user.id)
    .executeTakeFirstOrThrow();

  const score = Number(attempt.score);
  const previousScore = attempt.previous_attempt ? Number(attempt.previous_attempt.score) : null;
  const deltaScore = previousScore === null
    ? null
    : Math.round(score * 100 - previousScore * 100);
  const isIncrease = deltaScore !== null && deltaScore > 0;
  const isDecrease = deltaScore !== null && deltaScore < 0;

  return (
    <>
      <div className="border-b-2 pb-1 border-cyan-600 flex items-end justify-between">
        <h1 className="text-4xl font-medium">
          {attempt.quiz.name}
        </h1>

        <Link
          href={`/quiz/${String(attempt.quiz.id)}`}
          className="text-cyan-500">
          ← Back to quiz
        </Link>
      </div>

      <div className="flex justify-evenly">
        <div className="flex flex-col items-center">
          <p className="text-sm">{score === 1 ? '⭐️ ' : ''}Score</p>
          <p className="font-medium text-3xl">
            {Math.round(score * 100)}%
          </p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm">Change</p>
          <p className={`font-medium text-xl ${isIncrease ? 'text-green-500' : isDecrease ? 'text-red-500' : ''}`}>
            {deltaScore && deltaScore > 0 ? '+' : ''}{deltaScore ?? '--'}%
          </p>
          {attempt.previous_attempt && (
            <Link
              href={`/quiz/${String(attempt.quiz.id)}/attempt/${String(attempt.previous_attempt.id)}`}
              className="text-sm text-cyan-500">
              {ms(Date.now() - new Date(attempt.previous_attempt.timestamp).getTime())} ago
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-y-4">
        {attempt.questions.map(q => (
          <QuestionEntry question={q} key={q.id} />
        ))}
      </div>
    </>
  );

/*
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] items-center justify-center">
      <h2>You scored</h2>
      <h3 className="text-6xl font-medium">{Math.floor(attemptScore.score * 100)}%</h3>
    </div>
  );*/
}
