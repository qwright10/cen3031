import React from 'react';
import { Question } from '@/db';
import { QuestionDetail } from '@/app/quiz/[id]/question-detail';

interface QuestionEntryProps {
  readonly question: Question;
}

export function QuestionEntry({ question }: QuestionEntryProps) {
  return (
    <div className="grid grid-cols-[35%_65%] min-h-16 bg-gray-950/75 rounded-lg p-2">
      <div className="m-2 h-[calc(100%-1rem)] border-r border-cyan-800">
        <p className="text-sm h-full w-full pr-2">
          {question.prompt}
        </p>
      </div>

      <div className="px-2 flex flex-col gap-y-2 py-2 min-h-20">
        <QuestionDetail
          question={question} />
      </div>
    </div>
  );
}
