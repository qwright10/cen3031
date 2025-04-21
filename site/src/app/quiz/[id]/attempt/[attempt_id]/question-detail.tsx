import React from 'react';
import { Question } from '@/db';
import { QuestionAttempt } from '@/db/schema';

export interface QuestionDetailProps {
  readonly question: Question & QuestionAttempt;
}

export function QuestionDetail({ question }: QuestionDetailProps) {
  if (question.type === 'true_false') {
    const isCorrect = !question.answers[0];
    const wasSelected = !question.response[0];

    return (
      <div className="by-cyan-950 w-fit rounded-lg">
        <input
          type="checkbox"
          className="peer hidden"
          checked={wasSelected}
          readOnly />

        <button
          className={`px-2 py-1 ${isCorrect && wasSelected ? 'bg-cyan-600 shadow-cyan-800' : wasSelected ? 'bg-red-600' : isCorrect ? 'text-green-600' : ''} peer-checked:shadow peer-checked:rounded-lg`}
          disabled>
          True
        </button>
        <button
          className={`px-2 py-1  ${!isCorrect && !wasSelected ? 'bg-cyan-600 shadow-cyan-800' : !wasSelected ? 'bg-red-600' : !isCorrect ? 'text-green-600' : ''} shadow peer-checked:shadow-none rounded-lg`}
          disabled>
          False
        </button>
      </div>
    );
  }

  const isSelect = question.type === 'multiple_select';

  return (
    <>
      {(question.choices ?? []).map((choice, i) => {
        const isCorrect = question.answers.includes(i);
        const wasSelected = question.response.includes(i);

        return (
          <div className="flex space-x-2 items-center group" key={i}>
            {/* Checkbox / radio */}
            <input
              type={isSelect ? 'checkbox' : 'radio'}
              className={isCorrect && wasSelected ? 'accent-cyan-900' : wasSelected ? 'accent-red-600' :  'accent-green-500'}
              checked={isCorrect || wasSelected}
              name={`${question.id}-${String(i)}`}
              readOnly />

            {/* Choice text */}
            <p className="text-sm min-h-6">
              {choice}
            </p>
          </div>
        );
      })}
    </>
  );
}
