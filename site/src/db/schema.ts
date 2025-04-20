import {
  ColumnType,
  Generated,
  JSONColumnType,
  Selectable,
} from 'kysely';

type View<T> = {
  [K in keyof Selectable<T>]: ColumnType<Selectable<T>[K], never, never>;
};

export interface Database {
  account: Account;
  challenge: Challenge;
  credential: Credential;
  quiz: Quiz;
  question_type: QuestionType;
  question: Question;

  question_attempt: QuestionAttempt;
  quiz_attempt: QuizAttempt;
  scored_question_attempt: ScoredQuestionAttempt;
  scored_quiz_attempt: ScoredQuizAttempt;
}

export interface Account {
  id: Generated<string>;
  email_hash: string | null;
  password: string | null;
  is_email_verified: Generated<boolean>;
  username: string;
}

export interface Challenge {
  id: Generated<string>;
  started_at: ColumnType<Date, string | undefined, never>;
  challenge: Generated<Buffer>;
  username: string | null;
  password: string | null;
  email_hash: string | null;
  user_id: string | null;
}

export interface Credential {
  id: Buffer;
  user_id: string;
  type: string;
  sign_count: number;
  uv_initialized: boolean;
  transports: string[];
  backup_eligible: boolean;
  backup_state: boolean | null;
  jwt: JSONColumnType<object | null>;
}

export interface Quiz {
  id: Generated<string>;
  owner_id: string;
  name: string;
  is_private: boolean;
  created_at: ColumnType<Date, string | undefined, never>;
}

export const QuestionType = {
  multiple_choice: 'multiple_choice',
  multiple_select: 'multiple_select',
  true_false: 'true_false',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export interface Question {
  id: Generated<string>;
  quiz_id: string;
  type: QuestionType,
  prompt: string;
  choices: string[] | null,
  answers: number[],
}

export interface QuizAttempt {
  id: Generated<number>;
  quiz_id: string;
  account_id: string;
  timestamp: ColumnType<Date, string | undefined, never>;
}

export interface QuestionAttempt {
  id: Generated<number>;
  attempt_id: number;
  question_id: string;
  response: number[];
}

export type ScoredQuestionAttempt = View<QuestionAttempt & {
  is_correct: boolean;
}>;

export type ScoredQuizAttempt = View<QuizAttempt & {
  score: number;
}>;
