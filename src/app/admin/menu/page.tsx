'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatRupiah } from '@/lib/utils';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Check, Eye, EyeOff } from 'lucide-react';

interface Category { id: number; name: string; slug: string; icon: string; }
interface MenuItem {
  id: number; name: string; description: string; price: number;
  image_url: string; category_id: number; category_name: string;
  is_available: number; is_featured: number;
}

const emptyForm = {
  name: '', description: '', price: '', category_id: '',
  image_url: '', is_available: 1, is_featured: 0,
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterCat !== 'all') params.set('category', filterCat);
    if (search) params.set('search', search);
    // Fetch all items including unavailable ones for admin
    const [itemsRes, catsRes] = await Promise.all([
      fetch(`/api/menu?${params}`),
      fetch('/api/categories'),
    ]);
    const [itemsData, catsData] = await Promise.all([itemsRes.json(), catsRes.json()]);
    setItems(Array.isArray(itemsData) ? itemsData : []);
    setCategories(Array.isArray(catsData) ? catsData : []);
    setLoading(false);
  }, [filterCat, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editId ? `/api/menu/${editId}` : '/api/menu';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: Number(form.price), category_id: Number(form.category_id) }),
    });
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(false);
    setSubmitting(false);
    fetchData();
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      name: item.name, description: item.description, price: String(item.price),
      category_id: String(item.category_id), image_url: item.image_url || '',
      is_available: item.is_available, is_featured: item.is_featured,
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Nonaktifkan menu ini?')) return;
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleAvailable = async (item: MenuItem) => {
    await fetch(`/api/menu/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, is_available: item.is_available === 1 ? 0 : 1 }),
    });
    fetchData();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="font-hand text-3xl font-bold text-[#1A1A1A]">Manajemen Menu</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2563EB] transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Menu
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">{editId ? 'Edit Menu' : 'Tambah Menu'}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Nama Menu *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Harga (Rp) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" required min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Kategori *</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" required>
                    <option value="">Pilih kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">URL Gambar</label>
                <input type="url" value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_available === 1} onChange={e => setForm(f => ({...f, is_available: e.target.checked ? 1 : 0}))} className="w-4 h-4" />
                  <span className="text-sm">Tersedia</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured === 1} onChange={e => setForm(f => ({...f, is_featured: e.target.checked ? 1 : 0}))} className="w-4 h-4" />
                  <span className="text-sm">Menu Favorit</span>
                </label>
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

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Cari menu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] flex-1 min-w-40"
        />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]">
          <option value="all">Semua Kategori</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse bg-gray-100 h-52 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className={`bg-white rounded-xl border overflow-hidden ${item.is_available ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
              <div className="relative h-32 bg-gray-50 overflow-hidden">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">☕</div>
                )}
                {item.is_featured === 1 && (
                  <div className="absolute top-2 left-2 bg-[#2563EB] text-white text-xs px-1.5 py-0.5 rounded">★</div>
                )}
                {item.is_available === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-red-500 px-2 py-0.5 rounded">Nonaktif</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.category_name}</p>
                <p className="text-sm font-bold text-[#2563EB] mt-1">{formatRupiah(item.price)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={() => toggleAvailable(item)} className={`flex items-center gap-1 text-xs px-1.5 py-1 rounded border flex-1 justify-center ${item.is_available ? 'border-green-200 text-green-700 hover:bg-green-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {item.is_available ? <><Eye className="w-3 h-3" /> Aktif</> : <><EyeOff className="w-3 h-3" /> Nonaktif</>}
                  </button>
                  <button onClick={() => handleEdit(item)} className="p-1.5 border border-gray-200 rounded text-gray-500 hover:text-blue-600 hover:border-blue-200">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 border border-gray-200 rounded text-gray-500 hover:text-red-600 hover:border-red-200">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

