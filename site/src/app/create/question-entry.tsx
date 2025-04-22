import React from 'react';
import { QuestionType } from '@/db/schema';
import { TempQuestion, trueFalseOptions, clone } from './types';
import type { QuestionStore } from '@/app/create/store';
import { QuestionDetail } from '@/app/create/question-detail';

interface QuestionEntryProps {
  question: TempQuestion;
  readonly index: number;
  readonly store: QuestionStore;
}

/**
 * Card for each question in quiz
 * @param question
 * @param index
 * @param store
 */
export function QuestionEntry({ question, index, store }: QuestionEntryProps) {
  const [type, setType] = React.useState<QuestionType>('multiple_choice');

  const [deleteConfirmationTimeout, setDeleteConfirmationTimeout] = React.useState<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (deleteConfirmationTimeout != null) {
        clearTimeout(deleteConfirmationTimeout);
      }
    };
  });

  // change the type of the question and update options
  const changeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as QuestionType;

    if (newValue === 'true_false') {
      question.options = trueFalseOptions();
    } else if (newValue === 'multiple_choice') {
      let seenCorrect = false;

      for (const option of question.options) {
        if (option.correct) {
          if (seenCorrect) {
            option.correct = false;
          } else {
            seenCorrect = true;
          }
        }
      }
    }

    question.type = newValue;

    // update question in store
    store.set(index)(clone(question));
    setType(newValue);
  };

  return (
    <div className="grid grid-cols-[35%_65%] min-h-16 bg-gray-950/75 rounded-lg p-2">
      <div className="m-2 h-[calc(100%-1rem)] border-r border-cyan-800">
        <textarea
          className="bg-transparent focus:outline-none text-sm resize-none h-full w-full pr-2"
          maxLength={1024}
          onChange={e => {
            question.prompt = e.currentTarget.value;
            store.set(index)(clone(question));
          }}
          value={question.prompt}
          placeholder="Prompt" />
      </div>

      <div className="px-2 flex flex-col gap-y-2">
        <select
          className="bg-transparent focus:outline-none text-xs text-cyan-500/75 rounded-sm w-fit"
          onChange={changeType}
          value={type}>
          <option value={QuestionType.multiple_choice}>Multiple Choice</option>
          <option value={QuestionType.multiple_select}>Multiple Select</option>
          <option value={QuestionType.true_false}>True/False</option>
        </select>

        <QuestionDetail
          deleteConfirmation={[deleteConfirmationTimeout, setDeleteConfirmationTimeout]}
          index={index}
          question={question}
          store={store} />
      </div>
    </div>
  );
}
