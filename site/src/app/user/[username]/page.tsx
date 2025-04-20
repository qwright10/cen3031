import { requireUser } from '@/session';
import { db } from '@/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import Link from 'next/link';
import ms from 'ms';
import { notFound } from 'next/navigation';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default async function User({ params }: UserPageProps) {
  const { username } = await params;
  const user = await requireUser();

  const target = await db
    .selectFrom('account')
    .select(['id', 'username', 'is_email_verified'])
    .select(eb => [
      eb.selectFrom('scored_quiz_attempt')
        .select('timestamp')
        .whereRef('scored_quiz_attempt.account_id', '=', 'account.id')
        .limit(1)
        .as('last_attempt_timestamp'),
      jsonArrayFrom(
        eb.selectFrom('quiz')
          .select(['quiz.id', 'quiz.name', 'quiz.is_private', 'quiz.created_at'])
          .innerJoin('question', 'question.quiz_id', 'quiz.id')
          .select(eb2 => [
            eb2.fn.count('question.id')
              .$castTo<number>()
              .as('question_count'),
            eb2.selectFrom('scored_quiz_attempt')
              .select('score')
              .whereRef('scored_quiz_attempt.account_id', '=', 'account.id')
              .whereRef('scored_quiz_attempt.quiz_id', '=', 'quiz.id')
              .orderBy('score desc')
              .limit(1)
              .as('best_attempt_score'),
            eb2.selectFrom('scored_quiz_attempt')
              .select('score')
              .whereRef('scored_quiz_attempt.account_id', '=', 'account.id')
              .whereRef('scored_quiz_attempt.quiz_id', '=', 'quiz.id')
              .orderBy('timestamp desc')
              .limit(1)
              .as('last_attempt_score'),
          ])
          .groupBy('quiz.id')
          .whereRef('quiz.owner_id', '=', 'account.id')
          .where(eb2 =>
            eb2.or([
              eb2('quiz.is_private', '=', false),
              eb2('quiz.owner_id', '=', user.id),
            ]),
          )
          .orderBy('created_at desc'),
      )
        .as('quizzes')])
    .where('username', '=', username)
    .executeTakeFirst();

  if (!target) {
    notFound();
  }

  const isSelf = target.id === user.id;
  const lastAttemptInterval = target.last_attempt_timestamp ? Date.now() - target.last_attempt_timestamp.getTime() : null;

  return (
    <>
      <div className="border-b-2 pb-1 border-cyan-600 flex items-end justify-between">
        <h1 className="text-4xl font-medium">
          {target.username}

          {target.id === user.id && (
            <span className="text-sm select-none">(You)</span>
          )}

          {target.is_email_verified && (
            <span className="text-green-400 text-sm select-none">✓</span>
          )}
        </h1>

        <p className="text-sm" suppressHydrationWarning>
          Last studied {lastAttemptInterval ? `${String(ms(lastAttemptInterval, { long: true }))} ago` : 'never'}
        </p>
      </div>

      <div className="grid grid-cols-[auto_auto_auto_min-content]">
        {!!target.quizzes.length && (
          <div className="grid grid-cols-subgrid items-end px-4 col-span-full font-medium mb-4">
            <h3>Quiz Name</h3>

            <h3>Visibility</h3>

            <h3>Questions</h3>

            <h3 className="text-right">PB&nbsp;/&nbsp;Last</h3>
          </div>
        )}

        {target.quizzes.map(quiz => (
          <div className="grid grid-cols-subgrid items-center px-4 col-span-full h-12 even:bg-cyan-900/50 rounded-lg" key={quiz.id}>
            <Link
              href={`/quiz/${quiz.id}`}
              className="font-semibold">
              {quiz.name}
            </Link>

            <p>{quiz.is_private ? '🔒 Private' : '🌐 Public'}</p>

            <p>{quiz.question_count} question{quiz.question_count === 1 ? '' : 's'}</p>

            <p className="text-right">
              <span className="font-medium">{quiz.best_attempt_score ? quiz.best_attempt_score.toFixed(2) : '--'}</span>
              &nbsp;/&nbsp;{quiz.last_attempt_score ? quiz.last_attempt_score.toFixed(2) : '--'}
            </p>

          </div>
        ))}

        {!target.quizzes.length && (isSelf ? (
          <p className="space-x-2">
            <span>There's nothing to see here :(</span>
            <Link href="/create" className="text-cyan-500 underline underline-offset-2">Go make a quiz!</Link>
          </p>
        ) : (
          <p>
            There's nothing to see here
          </p>
        ))}
      </div>
    </>
  );
}
