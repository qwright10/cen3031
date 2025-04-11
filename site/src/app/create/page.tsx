import React from 'react';
import { QuizEditor } from '@/app/create/quiz-editor';
import { requireUser } from '@/session';

export default async function CreatePage() {
  const user = await requireUser();

  return (
    <div className="max-w-screen-lg mx-auto px-6">
      <div className="mt-10 px-4 space-y-8">
        <input
          className="text-3xl w-96 font-medium bg-transparent focus:outline-none border-b-2 pb-1 border-cyan-950 focus:border-cyan-600"

          placeholder="Untitled"
          type="text" />

        <QuizEditor />
      </div>
    </div>
  );
}
