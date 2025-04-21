import React from 'react';
import { Question } from '@/db';
import { TrueFalse } from '@/app/quiz/[id]/attempt/true-false';

export interface QuestionDetailProps {
  readonly question: Omit<Question, 'answers'>;
}

export function QuestionDetail({ question }: QuestionDetailProps) {
  if (question.type === 'true_false') {
    return (
      <TrueFalse id={question.id} />
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
            name={question.id}
            value={i} />

          {/* Choice text */}
          <p className="text-sm min-h-6">
            {choice}
          </p>
        </div>
      ))}
    </>
  );
}
