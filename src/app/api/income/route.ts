import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getWIBDate } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = db
      .from('income')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);

    const { data, error } = await query;
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
    const { description, amount, payment_method, category, date } = await request.json();
    if (!description || !amount)
      return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 });

    const { data, error } = await db
      .from('income')
      .insert({
        description,
        amount,
        payment_method: payment_method || 'cash',
        category: category || 'lainnya',
        date: date || getWIBDate(),
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
