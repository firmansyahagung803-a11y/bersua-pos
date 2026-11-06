import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    let query = db
      .from('menu_items')
      .select('*, categories(name, slug, icon)')
      .eq('is_available', 1);

    if (category && category !== 'all') {
      // Filter by category slug via join
      const { data: cat } = await db
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (featured === '1') {
      query = query.eq('is_featured', 1);
    }

    query = query.order('is_featured', { ascending: false }).order('id', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    // Flatten categories join to match old shape
    const items = (data || []).map((item) => {
      const cat = item.categories as { name: string; slug: string; icon: string } | null;
      return {
        ...item,
        categories: undefined,
        category_name: cat?.name ?? '',
        category_slug: cat?.slug ?? '',
        category_icon: cat?.icon ?? '',
      };
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil menu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { name, description, price, category_id, image_url, is_available, is_featured } = await request.json();
    if (!name || !price || !category_id)
      return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 });

    const { data, error } = await db
      .from('menu_items')
      .insert({
        name,
        description: description || '',
        price,
        category_id,
        image_url: image_url || '',
        is_available: is_available ?? 1,
        is_featured: is_featured ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
