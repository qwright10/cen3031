'use client';

import { QuestionType } from '@/db/schema';

export interface TempQuestion {
  readonly id: string;
  prompt: string;
  type: QuestionType;
  options: TempOption[];
}

export function question(): TempQuestion {
  return {
    id: crypto.randomUUID(),
    prompt: '',
    type: QuestionType.multiple_choice,
    options: [
      option(true),
      option(false),
      option(false),
      option(false),
    ],
  };
}

export function clone(question: TempQuestion): TempQuestion {
  return {
    ...question,
    options: question.options.map(o => ({ ...o })),
  };
}

export interface TempOption {
  readonly id: string;
  correct: boolean;
  value: string;
}

export function trueFalseOptions(): TempOption[] {
  return [
    {
      id: crypto.randomUUID(),
      correct: true,
      value: '',
    },
    {
      id: crypto.randomUUID(),
      correct: false,
      value: '',
    },
  ];
}

export function option(correct = false): TempOption {
  return {
    id: crypto.randomUUID(),
    correct,
    value: '',
  };
}
