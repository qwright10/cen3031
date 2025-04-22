'use client';

import { Darumadrop_One } from 'next/font/google';
import Link from 'next/link';
import { Selectable } from 'kysely';
import { Account } from '@/db/schema';
import { UserDropdown } from '@/app/header/user-dropdown';

const darumadrop = Darumadrop_One({
  subsets: ['latin'],
  weight: '400',
});

interface HeaderProps {
  readonly user: Selectable<Account> | null;
}

/**
 * Header shown at the top of all pages
 * @param user
 */
export function Header({ user }: HeaderProps) {
  return (
    <div className="max-w-screen-lg mx-auto">
      <div className="flex items-center justify-between h-16 px-6 bg-gray-900 text-white">
        <Link href="/" className={`text-3xl h-11 text-cyan-500 select-none ${darumadrop.className}`}>
          SnapCards
        </Link>

        <nav className="flex items-center gap-x-6">
          <Link href="/">Home</Link>

          {user === null ? (
            <Link
              href="/login"
              className="bg-cyan-600 text-white px-4 py-1 rounded text-sm font-medium">
              Login
            </Link>
          ) : (
            <Link
              href="/create"
              className="bg-cyan-600 text-white px-4 py-1 rounded text-sm font-medium">
              Create&ensp;<span className="rotate-45 inline-block font-bold scale-125">⤬</span>
            </Link>
          )}

          {user && (
            <div className="group relative">
              <p className="px-2.5 py-0.5 rounded font-mono text-sm peer" tabIndex={0}>{user.username}</p>
              <UserDropdown user={user} />
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
