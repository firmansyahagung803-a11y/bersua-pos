'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatRupiah, formatDate, EXPENSE_CATEGORY_LABEL } from '@/lib/utils';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
}

const CATEGORIES = Object.entries(EXPENSE_CATEGORY_LABEL);

const emptyForm = { description: '', amount: '', category: 'bahan_baku', date: new Date().toISOString().split('T')[0], notes: '' };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (filterCat !== 'all') params.set('category', filterCat);
    const res = await fetch(`/api/expenses?${params}`);
    const data = await res.json();
    setExpenses(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filterCat]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editId ? `/api/expenses/${editId}` : '/api/expenses';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(false);
    setSubmitting(false);
    fetchExpenses();
  };

  const handleEdit = (exp: Expense) => {
    setForm({ description: exp.description, amount: String(exp.amount), category: exp.category, date: exp.date, notes: exp.notes || '' });
    setEditId(exp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pengeluaran ini?')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchExpenses();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-hand text-3xl font-bold text-[#1A1A1A]">Pengeluaran</h1>
          <p className="text-sm text-gray-500">Total: <strong>{formatRupiah(totalAmount)}</strong></p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2563EB] transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Pengeluaran
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">{editId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Deskripsi *</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Jumlah (Rp) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" required min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Tanggal *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Kategori *</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]">
                  {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Catatan</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] resize-none" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-[#1A1A1A] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" /> {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setFilterCat('all')} className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold border rounded-full transition-all ${filterCat === 'all' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
          Semua
        </button>
        {CATEGORIES.map(([k, v]) => (
          <button key={k} onClick={() => setFilterCat(k)} className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold border rounded-full transition-all ${filterCat === k ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            {v}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Deskripsi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kategori</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Jumlah</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5}><div className="animate-pulse bg-gray-100 h-4 m-4 rounded" /></td></tr>
              )) : expenses.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Belum ada pengeluaran</td></tr>
              ) : expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{exp.description}</p>
                    {exp.notes && <p className="text-xs text-gray-400 mt-0.5">{exp.notes}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full">
                      {EXPENSE_CATEGORY_LABEL[exp.category] || exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{formatRupiah(exp.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => handleEdit(exp)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

