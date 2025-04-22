import React from 'react';
import { clone, option, TempQuestion } from './types';
import type { QuestionStore } from './store';
import { Cancel } from '@/icons/cancel';
import { AddCircle } from '@/icons/add_circle';
import { Delete } from '@/icons/delete';

export interface QuestionDetailProps {
  readonly deleteConfirmation: [number | null, React.Dispatch<React.SetStateAction<number | null>>];
  readonly index: number;
  question: TempQuestion;
  readonly store: QuestionStore;
}

/**
 * Question detail displayed next to question prompt
 * @param index
 * @param question
 * @param store
 * @param deleteConfirmationTimeout
 * @param setDeleteConfirmationTimeout
 */
export function QuestionDetail({
  index,
  question,
  store,
  deleteConfirmation: [deleteConfirmationTimeout, setDeleteConfirmationTimeout],
}: QuestionDetailProps) {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  if (question.type === 'true_false') {
    // set checked status of checkbox and update question
    const check = (v: boolean) => () => {
      if (!checkboxRef.current) return;
      checkboxRef.current.checked = v;
      question.options[0].correct = v;
      question.options[1].correct = !v;
      store.set(index)(clone(question));
    };

    return (
      <div className="mt-2 by-cyan-950 w-fit rounded-lg">
        <input
          type="checkbox"
          className="peer hidden"
          defaultChecked={question.options[0].correct}
          ref={checkboxRef} />

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
  }

  const isSelect = question.type === 'multiple_select';

  return (
    <>
      {question.options.map(({ id, value, correct }, i) => (
        <div className="flex space-x-2 items-center group" key={id}>
          {/* Checkbox / radio */}
          <input
            type={isSelect ? 'checkbox' : 'radio'}
            className="accent-cyan-600"
            checked={correct}
            name={question.id}
            onChange={e => {
              if (isSelect) {
                question.options[i].correct = e.currentTarget.checked;
              } else {
                question.options = question.options.map(o => ({ ...o, correct: false }));
                question.options[i].correct = true;
              }

              store.set(index)(clone(question));
            }}
            suppressHydrationWarning
          />

          {/* Choice text */}
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
            className="disabled:cursor-not-allowed group"
            onClick={() => {
              question.options.splice(i, 1);
              store.set(index)(clone(question));
            }}
            disabled={question.options.length <= 2}>
            <Cancel fill="" className="fill-cyan-600 group-disabled:fill-cyan-800 invisible group-hover:visible group-focus-visible:visible w-3.5" />
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
          className="text-xs opacity-50 text-cyan-600 hover:opacity-100 focus-visible:opacity-100 transition-opacity items-center flex gap-x-1.5"
          onClick={() => {
            if (deleteConfirmationTimeout === null) {
              // set timeout to reset question deletion confirmation
              const timeout = window.setTimeout(() => {
                setDeleteConfirmationTimeout(null);
              }, 3000);

              setDeleteConfirmationTimeout(timeout);
            } else {
              // delete question after confirmation
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
