import React from 'react';
import { QuizEditor } from '@/app/create/quiz-editor';
import { requireUser } from '@/session';

export default async function CreatePage() {
  await requireUser();

  return (
    <div className="max-w-screen-lg mx-auto px-6">
      <div className="mt-10 px-4 space-y-8">
        <QuizEditor />
      </div>
    </div>
  );
}
