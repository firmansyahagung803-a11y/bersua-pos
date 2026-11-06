'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import LiveClock from '@/components/LiveClock';
import { useCartStore } from '@/store/cart';
import { formatRupiah } from '@/lib/utils';
import { Search, ShoppingBag, Plus, Minus, Check } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
  category_slug: string;
  is_featured: number;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const { addItem, items: cartItems, updateQuantity } = useCartStore();

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (search) params.set('search', search);
    const res = await fetch(`/api/menu?${params}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [activeCategory, search]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchMenu, 300);
    return () => clearTimeout(timer);
  }, [fetchMenu]);

  const getCartQty = (id: number) => cartItems.find(i => i.id === id)?.quantity || 0;

  const handleAdd = (item: MenuItem) => {
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
    setAddedIds(prev => new Set([...prev, item.id]));
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(item.id); return s; }), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-hand text-5xl font-bold text-[#1A1A1A]">Menu Kami</h1>
              <p className="font-patrick text-[#3D3D3D] mt-1">Pilih yang kamu suka ☕</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <LiveClock />
              <Link href="/cart" className="flex items-center gap-2 btn-primary py-2 px-4">
                <ShoppingBag className="w-4 h-4" />
                <span>Keranjang</span>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D3D3D]" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-[#1A1A1A] bg-white rounded-sm font-patrick focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-4 py-2 border-2 font-hand text-sm font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white border-[#1A1A1A] hover:bg-[#EDE7D9]'
            }`}
          >
            🍽️ Semua
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`flex-shrink-0 px-4 py-2 border-2 font-hand text-sm font-semibold transition-all ${
                activeCategory === cat.slug
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white border-[#1A1A1A] hover:bg-[#EDE7D9]'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#EDE7D9] h-40 mb-3" />
                <div className="bg-[#EDE7D9] h-4 mb-2 w-3/4" />
                <div className="bg-[#EDE7D9] h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-hand text-3xl text-[#3D3D3D]">Menu tidak ditemukan 😕</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="mt-4 btn-primary">Reset Filter</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => {
              const qty = getCartQty(item.id);
              const isAdded = addedIds.has(item.id);
              return (
                <div key={item.id} className="bg-white border-2 border-[#1A1A1A] rounded-sm overflow-hidden card-hover group">
                  <Link href={`/menu/${item.id}`}>
                    <div className="relative h-36 bg-[#EDE7D9] overflow-hidden">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">☕</div>
                      )}
                      {item.is_featured === 1 && (
                        <div className="absolute top-2 left-2 bg-[#2563EB] text-white text-xs font-hand px-2 py-0.5">
                          ★ Favorit
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/menu/${item.id}`}>
                      <h3 className="font-hand text-base font-bold text-[#1A1A1A] hover:text-[#2563EB] transition-colors leading-tight">{item.name}</h3>
                    </Link>
                    <p className="font-patrick text-xs text-[#3D3D3D] mt-0.5 line-clamp-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-hand text-base font-bold text-[#2563EB]">{formatRupiah(item.price)}</span>
                      {qty === 0 ? (
                        <button
                          onClick={() => handleAdd(item)}
                          className={`flex items-center gap-1 text-xs font-hand font-semibold px-2.5 py-1 border-2 transition-all ${
                            isAdded
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-[#2563EB] hover:border-[#2563EB]'
                          }`}
                        >
                          {isAdded ? <><Check className="w-3 h-3" /> Ditambah</> : <><Plus className="w-3 h-3" /> Tambah</>}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 border-2 border-[#1A1A1A]">
                          <button onClick={() => updateQuantity(item.id, qty - 1)} className="p-1 hover:bg-[#EDE7D9]">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-hand font-bold text-sm w-6 text-center">{qty}</span>
                          <button onClick={() => handleAdd(item)} className="p-1 hover:bg-[#EDE7D9]">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

