'use client';

import React from 'react';
import Link from 'next/link';
import { register, RegisterResult } from '@/actions';

export default function RegisterPage() {
  const [error, setError] = React.useState('');
  const [usingPassword, setUsingPassword] = React.useState(false);

  const emailRef = React.useRef<HTMLInputElement>(null);
  const usernameRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const submit = () => {
    void (async () => {
      if (!usernameRef.current?.value || !passwordRef.current?.value) return;
      const username = usernameRef.current.value;
      const password = passwordRef.current.value;
      const email = emailRef.current?.value;

      const result = await register(username, password, email)
        .catch(() => 'unknown' as RegisterResult);

      if (result === 'conflict') {
        setError('Username or email already in use');
      } else if (result === 'invalid_username') {
        setError('Username is invalid');
      } else if (result === 'invalid_password') {
        setError('Password is invalid');
      } else if (result === 'success') {
        setError('');
      } else {
        setError('Unknown error occurred');
      }
    })();
  };

  return (
    <div className="flex flex-col mx-auto items-center gap-y-3">
      <h1 className="text-2xl font-medium my-16">Register</h1>

      <input
        type="text"
        className="px-2 py-2 w-56 bg-gray-800 rounded-lg focus:outline-none shadow-sm shadow-gray-950 ring-0 invalid:ring-2 ring-red-500"
        minLength={4}
        maxLength={24}
        placeholder="Username"
        autoComplete="username"
        pattern="[A-Za-z0-9\-]{4,24}"
        required
        ref={usernameRef} />

      <p className="text-right w-56 text-xs leading-none">4-24 chars.</p>

      <input
        type="text"
        className="px-2 py-2 w-56 bg-gray-800 rounded-lg focus:outline-none shadow-sm shadow-gray-950"
        placeholder="Email (optional)"
        autoComplete="email"
        ref={emailRef} />

      <input
        type="password"
        className="px-2 py-2 w-56 bg-gray-800 rounded-lg focus:outline-none shadow-sm shadow-gray-950 ring-0 invalid:ring-2 ring-red-500"
        placeholder="Password"
        autoComplete="new-password"
        required
        minLength={8}
        onChange={e => {
          setUsingPassword(e.currentTarget.value !== '');
        }}
        ref={passwordRef} />

      <p className="text-right w-56 text-xs leading-none">min 8 chars.</p>

      <button
        className="px-2 py-1.5 w-56 bg-cyan-600 rounded-lg font-medium"
        onClick={submit}>
        Continue
      </button>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
