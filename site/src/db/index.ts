import 'server-only';

import * as Schema from './schema';
import { Pool } from 'pg';
import { Kysely, PostgresDialect, Selectable } from 'kysely';

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env['DATABASE_URL'],
  }),
});

export const db = new Kysely<Schema.Database>({ dialect });

export { Schema };
export type Account = Selectable<Schema.Account>;
export type Challenge = Selectable<Schema.Challenge>;
export type Credential = Selectable<Schema.Credential>;
export type Quiz = Selectable<Schema.Quiz>;
export type Question = Selectable<Schema.Question>;
export type QuestionType = Schema.QuestionType;

export type ScoredQuestionAttempt = Selectable<Schema.ScoredQuestionAttempt>;
export type ScoredQuizAttempt = Selectable<Schema.ScoredQuizAttempt>;
