'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCartStore } from '@/store/cart';
import { formatRupiah } from '@/lib/utils';
import { ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
  is_featured: number;
}

export default function MenuDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);

  const { addItem, updateQuantity, items: cartItems } = useCartStore();
  const cartQty = cartItems.find(i => i.id === Number(params.id))?.quantity || 0;

  useEffect(() => {
    fetch(`/api/menu/${params.id}`)
      .then(r => r.json())
      .then(d => { setItem(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAdd = () => {
    if (!item) return;
    for (let i = 0; i < qty; i++) {
      addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
        <div className="bg-[#EDE7D9] h-64 mb-6" />
        <div className="bg-[#EDE7D9] h-8 mb-4 w-3/4" />
        <div className="bg-[#EDE7D9] h-4 w-full" />
      </div>
    </div>
  );

  if (!item) return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="font-hand text-3xl">Menu tidak ditemukan 😕</p>
        <Link href="/menu" className="mt-4 btn-primary inline-block">Kembali ke Menu</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 font-patrick text-sm text-[#3D3D3D] hover:text-[#1A1A1A] mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        {/* Image */}
        <div className="relative h-64 bg-[#EDE7D9] border-2 border-[#1A1A1A] overflow-hidden mb-6" style={{ transform: 'rotate(-0.5deg)' }}>
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} fill className="object-contain p-2" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">☕</div>
          )}
          {item.is_featured === 1 && (
            <div className="absolute top-4 right-4 bg-[#2563EB] text-white font-hand px-3 py-1 -rotate-2">
              ★ Menu Favorit
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0_#1A1A1A]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="font-patrick text-xs text-[#3D3D3D] bg-[#EDE7D9] px-2 py-0.5 inline-block mb-2">{item.category_name}</span>
              <h1 className="font-hand text-4xl font-bold text-[#1A1A1A]">{item.name}</h1>
            </div>
            <div className="text-right">
              <p className="font-hand text-3xl font-bold text-[#2563EB]">{formatRupiah(item.price)}</p>
            </div>
          </div>

          <p className="font-patrick text-[#3D3D3D] leading-relaxed mb-6">{item.description}</p>

          {/* Notes */}
          <div className="mb-6">
            <label className="font-hand text-sm font-semibold text-[#1A1A1A] block mb-1">Catatan khusus</label>
            <textarea
              placeholder="Misal: extra shot, less sugar, dll."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border-2 border-[#1A1A1A] rounded-sm px-3 py-2 font-patrick text-sm focus:outline-none focus:border-[#2563EB] resize-none"
              rows={2}
            />
          </div>

          {/* Qty & Add */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-[#1A1A1A]">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 hover:bg-[#EDE7D9]">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-hand text-xl font-bold w-10 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="p-2 hover:bg-[#EDE7D9]">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button onClick={handleAdd} className={`flex-1 btn-primary flex items-center justify-center gap-2 ${added ? 'bg-green-700 border-green-700' : ''}`}>
              <ShoppingBag className="w-4 h-4" />
              {added ? 'Ditambahkan! ✓' : `Tambah – ${formatRupiah(item.price * qty)}`}
            </button>
          </div>

          {cartQty > 0 && (
            <div className="mt-4 text-center">
              <Link href="/cart" className="font-patrick text-sm text-[#2563EB] underline">
                {cartQty} item di keranjang → Lihat Keranjang
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

