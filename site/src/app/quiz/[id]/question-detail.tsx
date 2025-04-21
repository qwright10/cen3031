import React from 'react';
import { Question } from '@/db';

export interface QuestionDetailProps {
  readonly question: Question;
}

export function QuestionDetail({ question }: QuestionDetailProps) {
  if (question.type === 'true_false') {
    return (
      <div className="by-cyan-950 w-fit rounded-lg">
        <input
          type="checkbox"
          className="peer hidden"
          checked={!question.answers[0]}
          readOnly />

        <button
          className="px-2 py-1 peer-checked:bg-cyan-600 peer-checked:shadow peer-checked:shadow-cyan-800  peer-checked:rounded-lg"
          disabled>
          True
        </button>
        <button
          className="px-2 py-1  bg-cyan-600 peer-checked:bg-transparent shadow peer-checked:shadow-none shadow-cyan-800 rounded-lg"
          disabled>
          False
        </button>
      </div>
    );
  }

  const isSelect = question.type === 'multiple_select';

  return (
    <>
      {(question.choices ?? []).map((choice, i) => (
        <div className="flex space-x-2 items-center group" key={i}>
          {/* Checkbox / radio */}
          <input
            type={isSelect ? 'checkbox' : 'radio'}
            className="accent-cyan-600"
            checked={question.answers.includes(i)}
            name={question.id}
            readOnly />

          {/* Choice text */}
          <p className="text-sm min-h-6">
            {choice}
          </p>
        </div>
      ))}
    </>
  );
}
