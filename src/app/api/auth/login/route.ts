import { NextResponse } from 'next/server';
import { loginUser } from '@/backend/services/auth.service';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = await loginUser(username, password);
    return NextResponse.json(user);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    const status = msg.includes('wajib') ? 400 : msg.includes('salah') ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
