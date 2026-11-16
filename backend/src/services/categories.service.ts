import getDb from '../db';
import { Category } from '../types';

export async function getAllCategories(): Promise<Category[]> {
  const db = getDb();
  const { data, error } = await db
    .from('categories')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCategory(name: string, slug: string, icon = '☕'): Promise<Category> {
  if (!name || !slug) throw new Error('Name dan slug wajib');
  const db = getDb();
  const { data, error } = await db
    .from('categories')
    .insert({ name, slug, icon })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: number, updates: Partial<{ name: string; slug: string; icon: string }>): Promise<Category> {
  const db = getDb();
  const { data, error } = await db
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const db = getDb();
  const { error } = await db
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

