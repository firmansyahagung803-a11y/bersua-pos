'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface Category { id: number; name: string; slug: string; icon: string; }

const ICONS = ['☕','🧃','🍽️','🍰','✨','🥤','🍜','🥐','🧁','🍮','🥗','🥘'];
const emptyForm = { name: '', slug: '', icon: '☕' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const data = await fetch('/api/categories').then(r => r.json());
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (editId) {
      await fetch(`/api/categories/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(false);
    setSubmitting(false);
    fetchCategories();
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kategori ini? Menu yang terkait mungkin terpengaruh.')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="font-hand text-3xl font-bold text-[#1A1A1A]">Kategori Menu</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2563EB] transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Slug (URL) *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`w-9 h-9 text-xl rounded-lg border-2 transition-all ${form.icon === icon ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
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

      {/* Categories grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 group hover:border-[#2563EB] transition-all">
              <div className="text-4xl">{cat.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{cat.name}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{cat.slug}</p>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

