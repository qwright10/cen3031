import { getUser } from '@/session';
import { redirect } from 'next/navigation';
import RegisterPage from '@/app/register/client-page';

export default async function RegisterPageWrapper() {
  const user = await getUser();
  if (user) redirect('/');

  return (
    <RegisterPage />
  );
}
