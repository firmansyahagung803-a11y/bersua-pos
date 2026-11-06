import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const db = getDb();
    const { data, error } = await db
      .from('users')
      .select('id, name, username, role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { name, username, password, role, is_active } = await request.json();
    if (!name || !username || !password)
      return NextResponse.json({ error: 'Nama, username, dan password wajib diisi' }, { status: 400 });

    // Check username unique
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existing) return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);
    const { data, error } = await db
      .from('users')
      .insert({
        name,
        username,
        password: hash,
        role: role || 'cashier',
        is_active: is_active !== undefined ? is_active : 1,
      })
      .select('id')
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
