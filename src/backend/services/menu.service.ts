import getDb from '@/backend/db';
import { MenuItem } from '@/backend/types';

interface MenuFilters {
  category?: string | null;
  search?: string | null;
  featured?: string | null;
}

export async function getMenuItems(filters: MenuFilters = {}): Promise<MenuItem[]> {
  const db = getDb();
  let query = db
    .from('menu_items')
    .select('*, categories(name, slug, icon)')
    .neq('is_available', 0);

  if (filters.category && filters.category !== 'all') {
    const isNum = !isNaN(Number(filters.category));
    let catId: number | null = null;
    if (isNum) {
      catId = Number(filters.category);
    } else {
      const { data: cat } = await db
        .from('categories')
        .select('id')
        .or(`slug.eq.${filters.category},slug.ilike.${filters.category},name.ilike.${filters.category}`)
        .limit(1)
        .maybeSingle();
      if (cat) catId = cat.id;
    }
    if (catId) {
      query = query.eq('category_id', catId);
    }
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters.featured === '1' || filters.featured === 'true') {
    query = query.eq('is_featured', 1);
  }

  query = query.order('is_featured', { ascending: false }).order('id', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item) => {
    const cat = item.categories as { name: string; slug: string; icon: string } | null;
    return {
      ...item,
      categories: undefined,
      category_name: cat?.name ?? '',
      category_slug: cat?.slug ?? '',
      category_icon: cat?.icon ?? '',
    };
  });
}

export async function getMenuItemById(id: number): Promise<MenuItem | null> {
  const db = getDb();
  const { data, error } = await db
    .from('menu_items')
    .select('*, categories(name, slug, icon)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  const cat = data.categories as { name: string; slug: string; icon: string } | null;
  return {
    ...data,
    categories: undefined,
    category_name: cat?.name ?? '',
    category_slug: cat?.slug ?? '',
    category_icon: cat?.icon ?? '',
  };
}

export async function createMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem> {
  const { name, price, category_id, description, image_url, is_available, is_featured } = itemData;
  if (!name || !price || !category_id) {
    throw new Error('Field wajib tidak lengkap');
  }

  const db = getDb();
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
  return data;
}

export async function updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
  const db = getDb();
  const { data, error } = await db
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMenuItem(id: number): Promise<boolean> {
  const db = getDb();
  const { error } = await db.from('menu_items').delete().eq('id', id);
  if (error) throw error;
  return true;
}
