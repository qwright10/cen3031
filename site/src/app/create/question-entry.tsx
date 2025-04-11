import React from 'react';
import { QuestionType } from '@/db/schema';
import { AddCircle } from '@/icons/add_circle';
import { Cancel } from '@/icons/cancel';
import { Delete } from '@/icons/delete';
import { TempQuestion, option, trueFalseOptions } from './types';
import type { QuestionStore } from '@/app/create/quiz-editor';

interface QuestionEntryProps {
  question: TempQuestion;
  readonly index: number;
  readonly store: QuestionStore;
}

function clone(question: TempQuestion): TempQuestion {
  return {
    ...question,
    options: question.options.map(o => ({ ...o })),
  };
}

export function QuestionEntry({ question, index, store }: QuestionEntryProps) {
  const questionId = React.useId();
  const [type, setType] = React.useState<QuestionType>('multiple_choice');

  const checkboxRef = React.useRef<HTMLInputElement>(null);

  const [deleteConfirmationTimeout, setDeleteConfirmationTimeout] = React.useState<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (deleteConfirmationTimeout != null) {
        clearTimeout(deleteConfirmationTimeout);
      }
    };
  });

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

    store.set(index)(clone(question));
    setType(newValue);
  };

  let questionDetail: React.JSX.Element;
  if (type === QuestionType.true_false) {
    const check = (v: boolean) => () => {
      if (!checkboxRef.current) return;
      checkboxRef.current.checked = v;
    };

    questionDetail = (
      <div className="mt-2 bg-cyan-950 w-fit rounded-lg">
        <input type="checkbox" className="peer hidden" ref={checkboxRef} />

        <button
          className="px-2 py-1 peer-checked:bg-cyan-600 peer-checked:shadow peer-checked:shadow-cyan-800  peer-checked:rounded-lg"
          onClick={check(true)}>
          True
        </button>
        <button
          className="px-2 py-1  bg-cyan-600 peer-checked:bg-transparent shadow peer-checked:shadow-none shadow-cyan-800 rounded-lg"
          onClick={check(false)}>
          False
        </button>
      </div>
    );
  } else {
    const isSelect = type === QuestionType.multiple_select;

    questionDetail = (
      <>
        {question.options.map(({ id, value, correct }, i) => (
          <div key={id} className="flex space-x-2 items-center group">
            {/* Checkbox / radio */}
            <input
              type={isSelect ? 'checkbox' : 'radio'}
              className="accent-cyan-600"
              checked={correct}
              onChange={e => {
                if (isSelect) {
                  question.options[i].correct = e.currentTarget.checked;
                } else {
                  for (const option of question.options) {
                    option.correct = false;
                  }

                  question.options[i].correct = true;
                }

                store.set(index)(clone(question));
              }}
              name={questionId} />

            {/* Prompt */}
            <input
              type="text"
              placeholder={`Option ${String(i + 1)}`}
              onChange={e => {
                question.options[i].value = e.currentTarget.value;

                store.set(index)(clone(question));
              }}
              value={value}
              className="bg-transparent focus:outline-none text-sm grow resize-none" />

            {/* Delete button */}
            <button
              className="disabled:cursor-not-allowed"
              onClick={() => {
                question.options.splice(i, 1);
                store.set(index)(clone(question));
              }}
              disabled={question.options.length <= 2}>
              <Cancel fill="" className="fill-cyan-600 group-disabled:fill-cyan-800  invisible group-hover:visible w-3.5" />
            </button>
          </div>
        ))}

        <div className="flex items-center justify-between">
          <button
            className="text-xs text-cyan-600 flex items-center gap-x-1.5"
            onClick={() => {
              question.options.push(option(false));
              store.set(index)(clone(question));
            }}>
            <AddCircle fill="" className="fill-cyan-600 w-3.5" />
            Add choice
          </button>

          <button
            className="text-xs opacity-50 text-cyan-600 hover:opacity-100 transition-opacity items-center flex gap-x-1.5"
            onClick={() => {
              if (deleteConfirmationTimeout === null) {
                const timeout = window.setTimeout(() => {
                  setDeleteConfirmationTimeout(null);
                }, 3000);

                setDeleteConfirmationTimeout(timeout);
              } else {
                store.delete(index)();
              }
            }}>
            {deleteConfirmationTimeout === null ? 'Delete' : 'Confirm'}
            <Delete fill="" className="fill-cyan-600 w-3.5" />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="grid grid-cols-[35%_65%] min-h-16 bg-gray-950/75 rounded-lg p-2">
      <div className="m-2 h-[calc(100%-1rem)] border-r border-cyan-800">
        <textarea
          className="bg-transparent focus:outline-none text-sm resize-none h-full w-full pr-2"
          maxLength={1024}
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

        {questionDetail}
      </div>
    </div>
  );
}
