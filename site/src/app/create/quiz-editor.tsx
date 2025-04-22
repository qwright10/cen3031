'use client';

import { AddCircle } from '@/icons/add_circle';
import React from 'react';
import { QuestionEntry } from '@/app/create/question-entry';
import { question, TempQuestion } from './types';
import { EditToolbar } from '@/app/create/edit-toolbar';
import { createQuiz, CreateQuizValidation } from '@/actions';
import { store } from '@/app/create/store';

/**
 * Client-side quiz editor UI
 * @constructor
 */
export function QuizEditor() {
  const [questions, setQuestions] = React.useState<TempQuestion[]>([
    question(),
    question(),
  ]);

  const title = React.useRef<HTMLInputElement>(null);
  const visibility = React.useRef<HTMLSelectElement>(null);

  // question store
  const qs = store({ questions, setQuestions });

  // quiz submission state, if any
  const [submissionState, setSubmissionState] = React.useState<'loading' | CreateQuizValidation | null>(null);

  // call createQuiz server action and respond to validation result
  const submit = () => {
    void (async () => {
      if (!title.current || !visibility.current) return;
      if (submissionState === 'loading') return;

      setSubmissionState('loading');
      const validation = await createQuiz({
        title: title.current.value,
        visibility: visibility.current.value,
        questions: qs.questions,
      });
      setSubmissionState(validation);

      switch (validation.s) {
        case 'unknown':
          alert('An unknown error occurred');
          break;
        case 'missing_answer':
          alert(`Question ${String(validation.q + 1)} is missing a correct answer`);
          break;
        case 'missing_options':
          alert(`Question ${String(validation.q + 1)} is missing options`);
          break;
        case 'missing_prompt':
          alert(`Question ${String(validation.q + 1)} is missing a prompt`);
          break;
        case 'invalid_title':
          alert('The quiz needs a title');
          break;
      }
    })();
  };

  return (
    <>
      <input
        className="text-3xl w-96 font-medium bg-transparent focus:outline-none border-b-2 pb-1 border-cyan-950 focus:border-cyan-600 invalid:border-red-800 invalid:focus:border-red-500"
        ref={title}
        minLength={1}
        maxLength={128}
        placeholder="Untitled"
        type="text" />

      <div className="w-full">
        <div className="flex gap-x-12">
          <button
            className="flex gap-x-2 bg-gradient-to-br from-cyan-400 to-cyan-700 text-transparent bg-clip-text"
            onClick={() => { qs.add()(); }}>
            <AddCircle fill="" className="fill-cyan-400 w-4" />
            Add question
          </button>

          <div className="space-x-2">
            <label>Visibility</label>
            <select
              className="bg-transparent focus:outline-none text-cyan-400"
              ref={visibility}>
              <option value="private">Only me</option>
              <option value="public">Anyone</option>
            </select>
          </div>

          <button
            className="ml-auto text-lg bg-gradient-to-tl from-cyan-400 to-cyan-700 text-transparent bg-clip-text"
            onClick={submit}>
            Create
          </button>
        </div>

        <div className="grid my-4">
          {questions.map((q, i) => (
            <React.Fragment key={q.id}>
              <QuestionEntry question={q} index={i} store={qs} />
              <EditToolbar addQuestion={qs.add(i)} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
