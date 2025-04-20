import { Account } from '@/db';
import Link from 'next/link';

interface UserDropdownProps {
  readonly user: Account;
}

export function UserDropdown({ user }: UserDropdownProps) {
  return (
    <div className="hidden group-hover:block peer-focus-within:block absolute top-1/2 -right-4">
      <div className="flex flex-col m-6 bg-slate-800 shadow-lg shadow-slate-900 rounded-lg p-2 w-48">
        <Link
          href={`/user/${user.username}`}
          className="font-mono text-lg pl-3 py-1 rounded hover:bg-black/25">
          {user.username}
        </Link>

        <a href="/signout" className="text-red-600 hover:bg-red-600/25 pl-3 py-1 w-full text-left rounded">
          Sign out
        </a>
      </div>
    </div>
  );
}
