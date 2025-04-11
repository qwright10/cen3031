'use server';

import { db } from '@/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import sha1 from 'sha1';
import { DatabaseError } from 'pg';

function generateChallenge(username?: string, password?: string, emailHash?: string, userId?: string) {
  return db
    .insertInto('challenge')
    .values({
      username,
      password,
      email_hash: emailHash,
      user_id: userId,
    })
    .returningAll();
}

function signToken(userId: string) {
  return sign({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60),
  }, Buffer.from(jwtSecret, 'base64'));
}

export type RegisterResult = 'invalid_username' | 'invalid_password' | 'conflict' | 'success' | 'unknown';

export async function register(username: string, password: string, email?: string): Promise<RegisterResult> {
  if (!username.match(/^[A-Za-z0-9-]{4,24}$/)) return 'invalid_username';
  if (!password.match(/^.{8,}$/)) return 'invalid_password';

  let user;
  try {
    user = await db
      .insertInto('account')
      .values({
        username,
        email_hash: email ? sha1(email) : null,
        password: await hash(password, 10),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  } catch (e) {
    if (e instanceof DatabaseError && e.code === '23505') {
      return 'conflict';
    }

    return 'unknown';
  }

  const c = await cookies();
  c.set('__session', signToken(user.id));

  redirect('/');
}

export type LoginResult = 'not_found' | 'no_password' | 'incorrect_password' | 'success' | 'unknown';

const jwtSecret = String(process.env['JWT_SECRET']);

export async function login(username: string, password: string): Promise<LoginResult> {
  const user = await db
    .selectFrom('account')
    .selectAll()
    .where('username', '=', username)
    .executeTakeFirst();

  if (!user) return 'not_found';
  if (!user.password) return 'no_password';

  const passwordMatches = await compare(password, user.password);
  if (!passwordMatches) return 'incorrect_password';

  const c = await cookies();
  c.set('__session', signToken(user.id));

  return 'success';
}

export async function userCredentials(username: string) {
  return db
    .selectFrom('account')
    .select('account.id')
    .select(eb =>
      jsonArrayFrom(
        eb.selectFrom('credential')
          .select(['id', 'jwt'])
          .whereRef('credential.user_id', '=', 'account.id'),
      )
        .as('credentials'))
    .where('username', '=', username)
    .executeTakeFirst();
}
