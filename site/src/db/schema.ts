import {
  ColumnType,
  Generated,
  JSONColumnType,
} from 'kysely';

export interface Database {
  account: Account;
  challenge: Challenge;
  credential: Credential;
  quiz: Quiz;
  question_type: QuestionType;
  question: Question;
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

