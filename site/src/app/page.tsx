import { requireUser } from '@/session';

export default async function Home() {
  const user = await requireUser();

  return (
    <div className="">

    </div>
  );
}
