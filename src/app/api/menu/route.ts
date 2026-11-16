import { NextResponse } from 'next/server';
import { getMenuItems, createMenuItem } from '@/backend/services/menu.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const items = await getMenuItems({ category, search, featured });
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil menu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await createMenuItem(body);
    return NextResponse.json(item);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
