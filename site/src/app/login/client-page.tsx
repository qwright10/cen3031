'use client';

import React from 'react';
import { login, LoginResult } from '@/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function LoginPage() {
  const [error, setError] = React.useState('');

  const router = useRouter();

  const usernameRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault();

    void (async () => {
      if (!usernameRef.current?.value || !passwordRef.current?.value) return;
      const username = usernameRef.current.value;
      const password = passwordRef.current.value;

      const result = await login(username, password)
        .catch((err: unknown) => {
          console.error(err);
          return 'unknown' as LoginResult;
        });

      if (result === 'not_found') {
        setError('Username does not exist');
      } else if (result === 'no_password') {
        setError('User does not have a password');
      } else if (result === 'incorrect_password') {
        setError('Incorrect password');
      } else if (result === 'success') {
        setError('');
        router.push('/');
      } else {
        setError('Unknown error occurred');
      }
    })();
  };

  return (
    <form onSubmit={submit} className="flex flex-col mx-auto items-center space-y-3">
      <h1 className="text-2xl font-medium my-16">Log In</h1>

      <input
        type="text"
        className="px-2 py-2 w-56 bg-gray-800 rounded-lg focus:outline-none shadow-sm shadow-gray-950"
        maxLength={24}
        placeholder="Username"
        autoComplete="username"
        onSubmit={submit}
        ref={usernameRef} />

      <input
        type="password"
        className="px-2 py-2 w-56 bg-gray-800 rounded-lg focus:outline-none shadow-sm shadow-gray-950"
        placeholder="Password"
        autoFocus
        autoComplete="current-password"
        ref={passwordRef} />

      <button
        className="px-2 py-1.5 w-56 bg-cyan-600 rounded-lg font-medium"
        onClick={submit}>
        Continue
      </button>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <p className="text-gray-400 py-4">or</p>

      <button
        className="px-2 py-1.5 mb-3 w-56 bg-cyan-600 rounded-lg font-medium">
        Sign in with a passkey
      </button>

      <p>New here? <Link className="text-cyan-500 hover:underline" href="/register">Create an account</Link></p>
    </form>
  );
}
