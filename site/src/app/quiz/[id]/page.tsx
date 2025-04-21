import { db } from '@/db';
import { requireUser } from '@/session';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { notFound } from 'next/navigation';
import ms from 'ms';
import Link from 'next/link';
import { QuestionEntry } from '@/app/quiz/[id]/question-entry';

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function Quiz({ params }: QuizPageProps) {
  const { id } = await params;
  const user = await requireUser();

  const quiz = await db
    .with('attempts', eb =>
      eb.selectFrom('scored_quiz_attempt')
        .selectAll()
        .where('scored_quiz_attempt.account_id', '=', user.id)
        .where('scored_quiz_attempt.quiz_id', '=', id)
        .orderBy('timestamp desc'),
    )
    .with('last_ten', eb =>
      eb.selectFrom('attempts')
        .selectAll()
        .limit(10))
    .selectFrom('quiz')
    .selectAll()
    .select(eb => [
      jsonObjectFrom(
        eb.selectFrom('account')
          .select('account.username')
          .whereRef('account.id', '=', 'quiz.owner_id'),
      )
        .$notNull()
        .as('owner'),
      jsonArrayFrom(
        eb.selectFrom('question')
          .selectAll()
          .whereRef('question.quiz_id', '=', 'quiz.id'),
      )
        .as('questions'),
      jsonObjectFrom(
        eb.selectFrom('last_ten')
          .select(eb2 => [
            eb2.fn.max('last_ten.timestamp')
              .orderBy('timestamp', 'desc')
              .as('most_recent_timestamp'),
            eb2.fn.avg('last_ten.score')
              .orderBy('timestamp', 'desc')
              .as('average_score'),
            eb2.fn.count('last_ten.score')
              .orderBy('timestamp', 'desc')
              .as('count'),
          ])
          .limit(1),
      )
        .as('last_ten_attempts'),
      jsonObjectFrom(
        eb.selectFrom('attempts')
          .select(['id', 'score', 'timestamp'])
          .orderBy('score desc')
          .limit(1),
      )
        .as('best_attempt'),
      jsonObjectFrom(
        eb.selectFrom('attempts')
          .select(['id', 'score', 'timestamp'])
          .orderBy('timestamp desc')
          .limit(1),
      )
        .as('last_attempt'),
    ])
    .where(eb => eb.and([
      eb('id', '=', id),
      eb.or([
        eb('is_private', '=', false),
        eb('owner_id', '=', user.id),
      ]),
    ]))
    .executeTakeFirst()
    .catch(() => notFound());

  if (!quiz) {
    notFound();
  }

  return (
    <>
      <div className="border-b-2 pb-1 border-cyan-600 flex items-end justify-between">
        <h1 className="text-4xl font-medium">
          {quiz.name}
          <span className="text-sm">{quiz.is_private ? '🔒' : '🌐'}</span>
        </h1>

        <Link
          href={`/user/${quiz.owner.username}`}
          className="text-cyan-500">🧑‍💻 {quiz.owner.username}</Link>

        <p className="text-sm">
          Created {ms(Date.now() - quiz.created_at.getTime(), { long: true })} ago
        </p>

        <Link
          href={`/quiz/${quiz.id}/attempt`}
          className="bg-cyan-600 px-3 py-0.5 rounded">
          Start →
        </Link>
      </div>

      <div className="flex justify-evenly">
        <div className="flex flex-col items-center">
          <p className="text-sm">🏆 PB</p>
          <p className="font-medium text-xl">{quiz.best_attempt?.score ? Math.round(quiz.best_attempt.score * 100) : '--'}%</p>
          {quiz.best_attempt && (
            <Link
              href={`/quiz/${quiz.id}/attempt/${String(quiz.best_attempt.id)}`}
              className="text-sm text-cyan-500">
              {ms(Date.now() - new Date(quiz.best_attempt.timestamp).getTime())} ago
            </Link>
          )}
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm">Last {quiz.last_ten_attempts?.count ?? 0} avg.</p>
          <p className="font-medium text-xl">{quiz.last_ten_attempts ? Math.round(Number(quiz.last_ten_attempts.average_score) * 100) : '--'}%</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm">Last attempt</p>
          <p className="font-medium text-xl">{typeof quiz.last_attempt?.score !== 'undefined' ? Math.round(quiz.last_attempt.score * 100) : '--'}%</p>
          {quiz.last_attempt && (
            <Link
              href={`/quiz/${quiz.id}/attempt/${String(quiz.last_attempt.id)}`}
              className="text-sm text-cyan-500">
              {ms(Date.now() - new Date(quiz.last_attempt.timestamp).getTime())} ago
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-y-4">
        {quiz.questions.map(q => (
          <QuestionEntry key={q.id} question={q} />
        ))}
      </div>
    </>
  );
}
