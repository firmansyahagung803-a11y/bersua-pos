import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const { name, username, password, role, is_active } = await request.json();
    if (!name || !username)
      return NextResponse.json({ error: 'Nama dan username wajib' }, { status: 400 });

    // Check username unique (excluding current user)
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', Number(id))
      .maybeSingle();

    if (existing) return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });

    const updatePayload: Record<string, string | number> = {
      name,
      username,
      role: role || 'cashier',
      is_active: is_active !== undefined ? is_active : 1,
    };

    if (password) {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    const { error } = await db
      .from('users')
      .update(updatePayload)
      .eq('id', Number(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    const { error } = await db
      .from('users')
      .delete()
      .eq('id', Number(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
