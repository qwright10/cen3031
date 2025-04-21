import React from 'react';

interface QuizLayoutProps {
  readonly children: React.ReactNode;
}

export default function QuizLayout({ children }: QuizLayoutProps) {
  return (
    <div className="max-w-screen-lg mx-auto px-6 pb-6">
      <div className="mt-10 px-4 space-y-8">
        {children}
      </div>
    </div>
  );
}
