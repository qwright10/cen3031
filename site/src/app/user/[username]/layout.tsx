import React from 'react';

interface UserLayoutProps {
  readonly children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="max-w-screen-lg mx-auto px-6">
      <div className="mt-10 px-4 space-y-8">
        {children}
      </div>
    </div>
  );
}
