import { LoginPage } from '@/app/login/client-page';
import { getUser } from '@/session';
import { redirect } from 'next/navigation';

export default async function LoginPageWrapper() {
  const user = await getUser();
  if (user) redirect('/');

  return (
    <LoginPage />
  );
}
