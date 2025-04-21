import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Quiz not found</h1>
      <Link className="text-cyan-500 underline underline-offset-2" href="/">Return Home</Link>
    </div>
  );
}
