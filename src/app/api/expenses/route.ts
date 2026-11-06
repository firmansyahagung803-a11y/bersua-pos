import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getWIBDate } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = db
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);
    if (category && category !== 'all') query = query.eq('category', category);

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
    const { description, amount, category, date, notes } = await request.json();
    if (!description || !amount || !category)
      return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 });

    const { data, error } = await db
      .from('expenses')
      .insert({
        description,
        amount,
        category,
        date: date || getWIBDate(),
        notes: notes || '',
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
