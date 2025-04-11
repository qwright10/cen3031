'use client';

import { AddCircle } from '@/icons/add_circle';
import React from 'react';
import { QuestionEntry } from '@/app/create/question-entry';
import { question, TempQuestion } from './types';
import { EditToolbar } from '@/app/create/edit-toolbar';

export interface QuestionStore {
  questions: TempQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<TempQuestion[]>>;

  add: (after?: number) => (q?: TempQuestion) => void;
  set: (at: number) => (q: TempQuestion) => void;
  delete: (at: number) => () => void;
}

const store = ({ questions, setQuestions }: Pick<QuestionStore, 'questions' | 'setQuestions'>): QuestionStore => {
  return {
    questions,
    setQuestions,

    add: (after = questions.length - 1) => (newQuestion = question()) => {
      setQuestions(q => [
        ...q.slice(0, after + 1),
        newQuestion,
        ...q.slice(after + 1),
      ]);
    },

    set: at => newQuestion => {
      setQuestions(q => {
        q[at] = newQuestion;
        return [...q];
      });
    },

    delete: at => () => {
      setQuestions(q => {
        q.splice(at, 1);

        if (q.length === 0) q = [question()];

        return [...q];
      });
    },
  };
};

export function QuizEditor() {
  const [questions, setQuestions] = React.useState<TempQuestion[]>([
    question(),
    question(),
  ]);

  const qs = store({ questions, setQuestions });

  return (
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
          <select className="bg-transparent focus:outline-none text-cyan-400">
            <option value="private">Only me</option>
            <option value="public">Anyone</option>
          </select>
        </div>

        <button
          className="ml-auto text-lg bg-gradient-to-tl from-cyan-400 to-cyan-700 text-transparent bg-clip-text">
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
  );
}
