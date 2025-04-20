import { requireUser } from '@/session';

interface AttemptResultsProps {
  params: Promise<{ attempt_id: string }>;
}

export default async function AttemptResults({ params }: AttemptResultsProps) {
  const { attempt_id } = await params;
  const user = await requireUser();

  return <></>;
}
