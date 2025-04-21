import { question, TempQuestion } from '@/app/create/types';
import React from 'react';

export interface QuestionStore {
  questions: TempQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<TempQuestion[]>>;

  add: (after?: number) => (q?: TempQuestion) => void;
  set: (at: number) => (q: TempQuestion) => void;
  delete: (at: number) => () => void;
}

export const store = ({ questions, setQuestions }: Pick<QuestionStore, 'questions' | 'setQuestions'>): QuestionStore => {
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
