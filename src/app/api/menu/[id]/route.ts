import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    const { data, error } = await db
      .from('menu_items')
      .select('*, categories(name, slug)')
      .eq('id', Number(id))
      .single();

    if (error || !data) return NextResponse.json({ error: 'Menu tidak ditemukan' }, { status: 404 });

    const cat = data.categories as { name: string; slug: string } | null;
    return NextResponse.json({
      ...data,
      categories: undefined,
      category_name: cat?.name ?? '',
      category_slug: cat?.slug ?? '',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.category_id !== undefined) updateData.category_id = Number(body.category_id);
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.is_available !== undefined) updateData.is_available = body.is_available;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;

    const { error } = await db
      .from('menu_items')
      .update(updateData)
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

    // Soft delete — nonaktifkan saja
    const { error } = await db
      .from('menu_items')
      .update({ is_available: 0 })
      .eq('id', Number(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
