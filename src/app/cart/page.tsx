'use client';
import { useCartStore } from '@/store/cart';
import { formatRupiah } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCartStore();
  const subtotal = total();
  const grandTotal = subtotal;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F0E8]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-hand text-4xl font-bold text-[#1A1A1A] mb-4">Keranjang Kosong</h2>
          <p className="font-patrick text-[#3D3D3D] mb-8">Yuk, tambahkan menu favoritmu!</p>
          <Link href="/menu" className="btn-primary font-hand text-xl">
            Lihat Menu →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-hand text-4xl font-bold text-[#1A1A1A]">Keranjang</h1>
          <button onClick={clearCart} className="font-patrick text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Kosongkan
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item.id} className="bg-white border-2 border-[#1A1A1A] flex items-center gap-3 p-3">
              <div className="relative w-16 h-16 flex-shrink-0 bg-[#EDE7D9] overflow-hidden border border-[#1A1A1A]">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">☕</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-hand text-base font-bold text-[#1A1A1A] truncate">{item.name}</h3>
                <p className="font-hand text-sm text-[#2563EB] font-semibold">{formatRupiah(item.price)}</p>
              </div>
              <div className="flex items-center gap-1 border-2 border-[#1A1A1A]">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-[#EDE7D9]">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-hand font-bold text-sm w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-[#EDE7D9]">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="text-right">
                <p className="font-hand text-sm font-bold">{formatRupiah(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 mt-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border-2 border-[#1A1A1A] p-5 shadow-[4px_4px_0_#1A1A1A] mb-6">
          <h3 className="font-hand text-xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b border-[#EDE7D9]">Ringkasan</h3>
          <div className="space-y-2 font-patrick text-sm">
            <div className="flex justify-between">
              <span className="text-[#3D3D3D]">Subtotal ({items.reduce((s,i) => s+i.quantity,0)} item)</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#EDE7D9]">
              <span className="font-bold font-hand text-base">Total</span>
              <span className="font-bold font-hand text-base text-[#2563EB]">{formatRupiah(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/menu" className="flex-1 border-2 border-[#1A1A1A] font-hand text-center py-3 hover:bg-[#EDE7D9] transition-colors">
            + Tambah Menu
          </Link>
          <Link href="/checkout" className="flex-1 btn-primary flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

