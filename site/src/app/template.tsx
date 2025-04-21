import React from 'react';
import { getUser } from '@/session';
import { Header } from '@/app/header';

interface TemplateProps {
  readonly children: React.ReactNode;
}

export default async function Template({ children }: TemplateProps) {
  const user = await getUser();

  return (
    <html lang="en">
      <body>
        <Header user={user} />
        {children}
      </body>
    </html>
  );
}
