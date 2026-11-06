'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { formatRupiah, formatDateTime, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '@/lib/utils';
import Link from 'next/link';
import { CheckCircle, Clock, Coffee } from 'lucide-react';

interface OrderDetail {
  id: number;
  order_number: string;
  customer_name: string;
  table_number: string;
  order_type: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  created_at: string;
  items: { id: number; name: string; price: number; quantity: number; subtotal: number }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(r => r.json())
      .then(d => { setOrder(d); setLoading(false); })
      .catch(() => setLoading(false));
    
    // Poll status every 10s
    const interval = setInterval(() => {
      fetch(`/api/orders/${params.id}`).then(r => r.json()).then(d => setOrder(d));
    }, 10000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin text-5xl mb-4">☕</div>
        <p className="font-hand text-xl">Memuat order...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <div className="text-center py-16">
        <p className="font-hand text-3xl">Order tidak ditemukan</p>
        <Link href="/" className="mt-4 btn-primary inline-block">Kembali</Link>
      </div>
    </div>
  );

  const statusIcon = {
    pending: <Clock className="w-6 h-6 text-yellow-500" />,
    processing: <Coffee className="w-6 h-6 text-blue-500 animate-bounce" />,
    ready: <CheckCircle className="w-6 h-6 text-green-500" />,
    completed: <CheckCircle className="w-6 h-6 text-green-700" />,
  }[order.status] || <Clock className="w-6 h-6" />;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success banner */}
        <div className="bg-[#1A1A1A] text-white p-6 mb-6 text-center" style={{ transform: 'rotate(-0.5deg)' }}>
          <p className="font-hand text-xl mb-1">🎉 Order Berhasil!</p>
          <p className="font-hand text-4xl font-bold">#{order.order_number}</p>
          <p className="font-patrick text-sm text-gray-300 mt-2">{formatDateTime(order.created_at)}</p>
        </div>

        {/* Status */}
        <div className="bg-white border-2 border-[#1A1A1A] p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            {statusIcon}
            <div>
              <p className="font-hand text-xl font-bold">{ORDER_STATUS_LABEL[order.status] || order.status}</p>
              <p className="font-patrick text-xs text-[#3D3D3D]">
                {order.order_type === 'dine_in' ? `Meja ${order.table_number || '-'}` : 'Takeaway'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm font-patrick">
            <div className="bg-[#EDE7D9] p-2">
              <p className="text-xs text-[#3D3D3D]">Pelanggan</p>
              <p className="font-semibold">{order.customer_name}</p>
            </div>
            <div className="bg-[#EDE7D9] p-2">
              <p className="text-xs text-[#3D3D3D]">Pembayaran</p>
              <p className="font-semibold">{PAYMENT_METHOD_LABEL[order.payment_method] || order.payment_method}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border-2 border-[#1A1A1A] p-5 mb-4">
          <h3 className="font-hand text-lg font-bold mb-3">Detail Pesanan</h3>
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between py-2 border-b border-[#EDE7D9] font-patrick text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
          <div className="mt-3 space-y-1 font-patrick text-sm">
            <div className="flex justify-between font-hand text-base font-bold pt-1 border-t border-[#EDE7D9]">
              <span>Total</span><span className="text-[#2563EB]">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/menu" className="flex-1 border-2 border-[#1A1A1A] font-hand text-center py-3 hover:bg-[#EDE7D9] transition-colors">
            + Order Lagi
          </Link>
          <Link href="/" className="flex-1 btn-primary text-center py-3">
            Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}

