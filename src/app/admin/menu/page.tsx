'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { formatRupiah } from '@/lib/utils';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Check, Eye, EyeOff, Image as ImageIcon, Upload, Loader2, Link as LinkIcon } from 'lucide-react';

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

async function compressImage(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

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
  const [refreshKey, setRefreshKey] = useState(0);

  // Image upload states
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const params = new URLSearchParams();
      if (filterCat !== 'all') params.set('category', filterCat);
      if (search) params.set('search', search);

      try {
        const [itemsRes, catsRes] = await Promise.all([
          fetch(`/api/menu?${params}`),
          fetch('/api/categories'),
        ]);
        const [itemsData, catsData] = await Promise.all([itemsRes.json(), catsRes.json()]);
        if (active) {
          setItems(Array.isArray(itemsData) ? itemsData : []);
          setCategories(Array.isArray(catsData) ? catsData : []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load menu data:', err);
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [filterCat, search, refreshKey]);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm });
    setPreviewUrl('');
    setUploadingImage(false);
    setShowManualUrl(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      // Pratinjau lokal langsung agar pengguna tidak perlu menunggu upload selesai
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Kompres gambar di sisi klien untuk hemat kuota & cepat
      const compressedFile = await compressImage(file);

      const formData = new FormData();
      formData.append('file', compressedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal mengunggah foto');
      }

      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, image_url: data.url }));
        setPreviewUrl(data.url);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah foto';
      alert(msg);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm(f => ({ ...f, image_url: '' }));
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editId ? `/api/menu/${editId}` : '/api/menu';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        image_url: form.image_url || '',
        price: Number(form.price),
        category_id: Number(form.category_id),
      }),
    });
    handleCloseForm();
    setSubmitting(false);
    refreshData();
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category_id: String(item.category_id),
      image_url: item.image_url || '',
      is_available: item.is_available,
      is_featured: item.is_featured,
    });
    setPreviewUrl(item.image_url || '');
    setShowManualUrl(false);
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Nonaktifkan menu ini?')) return;
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    refreshData();
  };

  const toggleAvailable = async (item: MenuItem) => {
    await fetch(`/api/menu/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, is_available: item.is_available === 1 ? 0 : 1 }),
    });
    refreshData();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="font-hand text-3xl font-bold text-[#1A1A1A]">Manajemen Menu</h1>
        <button
          onClick={() => {
            handleCloseForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2563EB] transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Menu
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">{editId ? 'Edit Menu' : 'Tambah Menu'}</h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Nama Menu *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Kategori *</label>
                  <select
                    value={form.category_id}
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    required
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Upload Foto Galeri (Opsional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium block">Foto Menu <span className="text-xs text-gray-400 font-normal">(Opsional)</span></label>
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {showManualUrl ? 'Sembunyikan URL manual' : 'Gunakan URL teks'}
                  </button>
                </div>

                {/* Input file tersembunyi yang menerima foto dari galeri/kamera */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 flex items-center gap-3">
                    <div className="relative w-20 h-20 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {/* Gunakan img tag standar untuk preview file lokal/base64/url */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview Foto"
                        className="w-full h-full object-contain p-1"
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">Foto Menu Terpilih</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {uploadingImage ? 'Sedang mengunggah...' : 'Foto siap disimpan'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Upload className="w-3 h-3" /> Ganti Foto
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage}
                          className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-[#2563EB] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-[#2563EB] bg-gray-50/60 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-sm text-[#2563EB] font-medium py-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mengunggah foto...
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-blue-100/80 flex items-center justify-center text-[#2563EB]">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-semibold block">Pilih Foto dari Galeri</span>
                          <span className="text-xs text-gray-400">Ketuk untuk mengambil foto dari galeri / kamera HP atau laptop</span>
                        </div>
                      </>
                    )}
                  </button>
                )}

                {/* Input manual URL (opsional jika toggle diaktifkan) */}
                {showManualUrl && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={e => {
                        const val = e.target.value;
                        setForm(f => ({ ...f, image_url: val }));
                        setPreviewUrl(val);
                      }}
                      placeholder="Masukkan URL foto atau path (/images/...)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_available === 1}
                    onChange={e => setForm(f => ({ ...f, is_available: e.target.checked ? 1 : 0 }))}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm">Tersedia</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured === 1}
                    onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked ? 1 : 0 }))}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm">Menu Favorit</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 border border-gray-200 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="flex-1 bg-[#1A1A1A] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Simpan
                    </>
                  )}
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
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
        >
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
                  <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" unoptimized />
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
