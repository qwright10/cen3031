'use server';

import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { db } from '@/db';
import { redirect } from 'next/navigation';
import { Account } from '@/db/schema';
import { Selectable } from 'kysely';

const jwtSecret = String(process.env['JWT_SECRET']);

// find and return the sessions user, if one exists
export async function getUser(): Promise<Selectable<Account> | null> {
  const c = await cookies();
  const __session = c.get('__session')?.value;

  if (!__session) return null;

  let token;
  try {
    token = verify(__session, Buffer.from(jwtSecret, 'base64'));
    if (typeof token === 'string' || !token.sub) throw new Error();
  } catch {
    c.delete('__session');
    return null;
  }

  const user = await db
    .selectFrom('account')
    .selectAll()
    .where('id', '=', token.sub)
    .executeTakeFirst();

  return user ?? null;
}

// require an active session or redirect to login page
export async function requireUser() {
  return await getUser() ?? redirect('/login');
}
