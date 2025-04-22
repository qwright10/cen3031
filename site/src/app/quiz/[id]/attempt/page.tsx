import React from 'react';
import { requireUser } from '@/session';
import { db } from '@/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { notFound } from 'next/navigation';
import { Timer } from '@/app/quiz/[id]/attempt/timer';
import { QuestionEntry } from '@/app/quiz/[id]/attempt/question-entry';
import { submitQuiz } from '@/actions';

function shuffled<T>(arrIn: readonly T[]): T[] {
  const arr = [...arrIn];
  let currentIndex = arr.length;

  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex--);
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
}

interface QuizAttemptProps {
  params: Promise<{ id: string }>;
}

export default async function QuizAttempt({ params }: QuizAttemptProps) {
  const { id } = await params;
  const user = await requireUser();

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
      eb('id', '=', id),
      eb.or([
        eb('is_private', '=', false),
        eb('owner_id', '=', user.id),
      ]),
    ]))
    .executeTakeFirst()
    .then(quiz => {
      if (!quiz) return quiz;
      return { ...quiz, questions: shuffled(quiz.questions) };
    })
    .catch(() => notFound());

  if (!quiz) notFound();

  return (
    <form action={submitQuiz} className="mt-10 space-y-8">
      <input type="hidden" name="quiz_id" value={quiz.id} />

      <div className="border-b-2 pb-1 border-cyan-600 flex items-end justify-between">
        <h1 className="text-4xl font-medium max-w-[70%]">{quiz.name}</h1>

        <Timer />

        <button className="bg-cyan-600 px-3 py-0.5 rounded">
          Submit
        </button>
      </div>

      <div className="grid gap-y-4">
        {quiz.questions.map(q => (
          <QuestionEntry question={q} key={q.id} />
        ))}
      </div>
    </form>
  );
}
