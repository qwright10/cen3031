import { Account } from '@/db';

interface UserDropdownProps {
  readonly user: Account;
}

export function UserDropdown({ user }: UserDropdownProps) {
  return (
    <div className="hidden group-hover:block absolute top-1/2 -right-4">
      <div className="flex flex-col gap-y-2 m-6 bg-slate-800 shadow-lg shadow-slate-900 rounded-lg p-2 w-48">
        <p className="font-mono text-lg pl-3 mt-1">{user.username}</p>

        <a href="/signout" className="text-red-600 hover:bg-red-600/25 pl-3 py-1 w-full text-left rounded">
          Sign out
        </a>
      </div>
    </div>
  );
}
