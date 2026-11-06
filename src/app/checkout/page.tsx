'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCartStore } from '@/store/cart';
import { formatRupiah } from '@/lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const subtotal = total();
  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    table_number: '',
    order_type: 'dine_in',
    payment_method: 'cash',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F0E8]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <p className="font-hand text-3xl">Keranjang kosong!</p>
          <Link href="/menu" className="mt-4 btn-primary inline-block">Lihat Menu</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name) { setError('Nama wajib diisi'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({ id: i.id, quantity: i.quantity, notes: i.notes })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat order');
      clearCart();
      router.push(`/order/${data.order_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-hand text-4xl font-bold text-[#1A1A1A] mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order summary */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4">
            <h3 className="font-hand text-lg font-bold mb-3">Pesanan ({items.length} item)</h3>
            {items.map(i => (
              <div key={i.id} className="flex justify-between font-patrick text-sm py-1 border-b border-[#EDE7D9]">
                <span>{i.name} × {i.quantity}</span>
                <span>{formatRupiah(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-hand text-base font-bold mt-2 pt-1">
              <span>Total (+ Pajak 10%)</span>
              <span className="text-[#2563EB]">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white border-2 border-[#1A1A1A] p-5">
            <h3 className="font-hand text-lg font-bold mb-4">Informasi Pelanggan</h3>
            <div className="space-y-3">
              <div>
                <label className="font-patrick text-sm font-semibold block mb-1">Nama <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={e => setForm(f => ({...f, customer_name: e.target.value}))}
                  placeholder="Nama kamu"
                  className="w-full border-2 border-[#1A1A1A] rounded-sm px-3 py-2 font-patrick focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>
              <div>
                <label className="font-patrick text-sm font-semibold block mb-1">No. HP</label>
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={e => setForm(f => ({...f, customer_phone: e.target.value}))}
                  placeholder="08xx..."
                  className="w-full border-2 border-[#1A1A1A] rounded-sm px-3 py-2 font-patrick focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="bg-white border-2 border-[#1A1A1A] p-5">
            <h3 className="font-hand text-lg font-bold mb-4">Tipe Pesanan</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {['dine_in', 'takeaway'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(f => ({...f, order_type: type}))}
                  className={`py-2 border-2 font-hand font-semibold transition-all ${
                    form.order_type === type
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white border-[#1A1A1A] hover:bg-[#EDE7D9]'
                  }`}
                >
                  {type === 'dine_in' ? '🪑 Dine In' : '🛵 Takeaway'}
                </button>
              ))}
            </div>
            {form.order_type === 'dine_in' && (
              <div>
                <label className="font-patrick text-sm font-semibold block mb-1">Nomor Meja</label>
                <input
                  type="text"
                  value={form.table_number}
                  onChange={e => setForm(f => ({...f, table_number: e.target.value}))}
                  placeholder="Meja 1, 2, ..."
                  className="w-full border-2 border-[#1A1A1A] rounded-sm px-3 py-2 font-patrick focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white border-2 border-[#1A1A1A] p-5">
            <h3 className="font-hand text-lg font-bold mb-4">Metode Pembayaran</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'cash', label: '💵 Tunai' },
                { key: 'qris', label: '📱 QRIS' },
                { key: 'transfer', label: '🏦 Transfer' },
                { key: 'debit', label: '💳 Kartu Debit' },
              ].map(pm => (
                <button
                  key={pm.key}
                  type="button"
                  onClick={() => setForm(f => ({...f, payment_method: pm.key}))}
                  className={`py-2 border-2 font-patrick text-sm font-semibold transition-all ${
                    form.payment_method === pm.key
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white border-[#1A1A1A] hover:bg-[#EDE7D9]'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-patrick text-sm font-semibold block mb-1">Catatan Tambahan</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              placeholder="Instruksi khusus..."
              className="w-full border-2 border-[#1A1A1A] rounded-sm px-3 py-2 font-patrick focus:outline-none focus:border-[#2563EB] resize-none"
              rows={2}
            />
          </div>

          {error && <div className="bg-red-50 border border-red-300 text-red-700 p-3 font-patrick text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-center py-3 font-hand text-xl disabled:opacity-50"
          >
            {loading ? 'Memproses...' : `Pesan Sekarang – ${formatRupiah(grandTotal)}`}
          </button>
        </form>
      </div>
    </div>
  );
}

