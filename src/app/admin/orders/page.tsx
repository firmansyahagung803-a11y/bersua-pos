'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatRupiah, formatDateTime, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '@/lib/utils';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  table_number: string;
  order_type: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterPayment !== 'all') params.set('payment_status', filterPayment);
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filterStatus, filterPayment]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const filtered = orders.filter(o =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.order_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="font-hand text-3xl font-bold text-[#1A1A1A]">Pesanan</h1>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama / nomor order..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
        >
          <option value="all">Semua Status</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select
          value={filterPayment}
          onChange={e => setFilterPayment(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
        >
          <option value="all">Semua Pembayaran</option>
          <option value="unpaid">Belum Bayar</option>
          <option value="paid">Sudah Bayar</option>
        </select>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Order</p>
          <p className="text-2xl font-bold text-[#1A1A1A]">{orders.length}</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-4 shadow-sm">
          <p className="text-xs text-orange-600 mb-1">Belum Bayar</p>
          <p className="text-2xl font-bold text-orange-700">{orders.filter(o => o.payment_status === 'unpaid').length}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 shadow-sm">
          <p className="text-xs text-green-600 mb-1">Sudah Bayar</p>
          <p className="text-2xl font-bold text-green-700">{orders.filter(o => o.payment_status === 'paid').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Order #</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Pelanggan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Meja/Tipe</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Metode Bayar</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bayar</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Waktu</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="animate-pulse bg-gray-100 h-4 rounded w-full" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">Belum ada pesanan</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-[#2563EB]">{order.order_number}</td>
                  <td className="px-4 py-3 font-medium">{order.customer_name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {order.order_type === 'dine_in' ? `🪑 Meja ${order.table_number || '-'}` : '🛍️ Takeaway'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {PAYMENT_METHOD_LABEL[order.payment_method] || order.payment_method}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                      {ORDER_STATUS_LABEL[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border
                      ${order.payment_status === 'paid'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                      {order.payment_status === 'paid' ? '✅ Lunas' : '⏳ Belum Bayar'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatRupiah(order.total)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{formatDateTime(order.created_at)}</td>
                  <td className="px-4 py-3">
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <div className="relative group">
                        <button className="flex items-center gap-1 text-xs border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">
                          Ubah <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block min-w-28">
                          {['processing', 'ready', 'completed', 'cancelled'].map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                            >
                              {ORDER_STATUS_LABEL[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">{filtered.length} pesanan ditampilkan</p>
    </div>
  );
}
