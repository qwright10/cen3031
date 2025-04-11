import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  revalidatePath('/', 'layout');

  const c = await cookies();
  c.delete('__session');

  const destination = new URL(request.url);
  destination.pathname = '/';

  return NextResponse.redirect(
    destination,
    {
      headers: {
        'Cache-Control': 'no-cache',
      },
    },
  );
}
