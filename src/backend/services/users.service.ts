import getDb from '@/backend/db';
import bcrypt from 'bcryptjs';
import { User } from '@/backend/types';

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  const db = getDb();
  const { data, error } = await db
    .from('users')
    .select('id, name, username, role, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createUser(payload: {
  name: string;
  username: string;
  password: string;
  role?: 'admin' | 'cashier';
  is_active?: number;
}): Promise<number> {
  const { name, username, password, role, is_active } = payload;
  if (!name || !username || !password) {
    throw new Error('Nama, username, dan password wajib diisi');
  }

  const db = getDb();
  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) throw new Error('Username sudah digunakan');

  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await db
    .from('users')
    .insert({
      name,
      username,
      password: hash,
      role: role || 'cashier',
      is_active: is_active !== undefined ? is_active : 1,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateUser(id: number, payload: {
  name?: string;
  username?: string;
  password?: string;
  role?: 'admin' | 'cashier';
  is_active?: number;
}): Promise<boolean> {
  const { name, username, password, role, is_active } = payload;
  if (!name || !username) throw new Error('Nama dan username wajib');

  const db = getDb();
  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('username', username)
    .neq('id', id)
    .maybeSingle();

  if (existing) throw new Error('Username sudah digunakan');

  const updatePayload: Record<string, unknown> = {
    name,
    username,
    role: role || 'cashier',
    is_active: is_active !== undefined ? is_active : 1,
  };

  if (password) {
    updatePayload.password = await bcrypt.hash(password, 10);
  }

  const { error } = await db.from('users').update(updatePayload).eq('id', id);
  if (error) throw error;
  return true;
}

export async function deleteUser(id: number): Promise<boolean> {
  const db = getDb();
  const { error } = await db.from('users').delete().eq('id', id);
  if (error) throw error;
  return true;
}
