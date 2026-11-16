import { NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/backend/services/categories.service';

export async function GET() {
  try {
    const data = await getAllCategories();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil kategori' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug, icon } = await request.json();
    const data = await createCategory(name, slug, icon);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
