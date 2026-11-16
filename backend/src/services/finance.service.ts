import getDb from '../db';
import { getWIBDate } from '../utils';
import { Income, Expense } from '../types';

export async function getIncomeList(filters: { from?: string | null; to?: string | null; limit?: number } = {}): Promise<Income[]> {
  const db = getDb();
  const limit = filters.limit || 100;

  let query = db
    .from('income')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters.from) query = query.gte('date', filters.from);
  if (filters.to) query = query.lte('date', filters.to);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createIncome(payload: {
  description: string;
  amount: number;
  payment_method?: string;
  category?: string;
  date?: string;
}): Promise<number> {
  const { description, amount, payment_method, category, date } = payload;
  if (!description || !amount) throw new Error('Field wajib tidak lengkap');

  const db = getDb();
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
  return data.id;
}

export async function getExpenseList(filters: { from?: string | null; to?: string | null; category?: string | null; limit?: number } = {}): Promise<Expense[]> {
  const db = getDb();
  const limit = filters.limit || 100;

  let query = db
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters.from) query = query.gte('date', filters.from);
  if (filters.to) query = query.lte('date', filters.to);
  if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  const db = getDb();
  const { data, error } = await db
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function createExpense(payload: {
  description: string;
  amount: number;
  category: string;
  date?: string;
  notes?: string;
}): Promise<number> {
  const { description, amount, category, date, notes } = payload;
  if (!description || !amount || !category) throw new Error('Field wajib tidak lengkap');

  const db = getDb();
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
  return data.id;
}

export async function updateExpense(id: number, payload: {
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
  notes?: string;
}): Promise<boolean> {
  const db = getDb();
  const { error } = await db
    .from('expenses')
    .update(payload)
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteExpense(id: number): Promise<boolean> {
  const db = getDb();
  const { error } = await db.from('expenses').delete().eq('id', id);
  if (error) throw error;
  return true;
}

