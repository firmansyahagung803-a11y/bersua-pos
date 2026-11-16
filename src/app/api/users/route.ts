import { NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/backend/services/users.service';

export async function GET() {
  try {
    const data = await getAllUsers();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = await createUser(body);
    return NextResponse.json({ id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
