import { question, TempQuestion } from '@/app/create/types';
import React from 'react';

/**
 * Question storage manager for quiz creation
 */
export interface QuestionStore {
  /**
   * array of question state while editing
   */
  questions: TempQuestion[];
  /**
   * sets stored questions
   */
  setQuestions: React.Dispatch<React.SetStateAction<TempQuestion[]>>;

  /**
   * Insert provided question after the question at the provided index
   * @param after
   */
  add: (after?: number) => (q?: TempQuestion) => void;
  /**
   * Replace question at the provided index
   * @param at
   */
  set: (at: number) => (q: TempQuestion) => void;
  /**
   * Delete question at the provided index
   * @param at
   */
  delete: (at: number) => () => void;
}

export const store = ({ questions, setQuestions }: Pick<QuestionStore, 'questions' | 'setQuestions'>): QuestionStore => {
  return {
    questions,
    setQuestions,

    add: (after = questions.length - 1) => (newQuestion = question()) => {
      setQuestions(q => [
        // questions before the new position
        ...q.slice(0, after + 1),
        // new question
        newQuestion,
        // remaining questions after the new position
        ...q.slice(after + 1),
      ]);
    },

    set: at => newQuestion => {
      setQuestions(q => {
        // set question at index
        q[at] = newQuestion;
        // return copy (required by React)
        return [...q];
      });
    },

    delete: at => () => {
      setQuestions(q => {
        // remove question at index
        q.splice(at, 1);

        // quiz must contain at least one question
        if (q.length === 0) q = [question()];

        // return copy (required by React)
        return [...q];
      });
    },
  };
};
