import { NextResponse } from 'next/server';
import { getExpenseList, createExpense } from '@/backend/services/finance.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');

    const data = await getExpenseList({ from, to, category, limit });
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = await createExpense(body);
    return NextResponse.json({ id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
