'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatRupiah } from '@/lib/utils';
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Stats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  topItems: { name: string; total_qty: number; total_revenue: number }[];
  dailyRevenue: { date: string; total: number }[];
  paymentBreakdown: { payment_method: string; count: number; total: number }[];
}

const PERIODS = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'week', label: '7 Hari' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'year', label: 'Tahun Ini' },
];

const PM_LABELS: Record<string, string> = {
  cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer', debit: 'Debit',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/stats?period=${period}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = stats ? [
    { label: 'Total Pemasukan', value: formatRupiah(stats.totalIncome), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Pengeluaran', value: formatRupiah(stats.totalExpenses), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Laba Bersih', value: formatRupiah(stats.netProfit), icon: DollarSign, color: stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600', bg: 'bg-blue-50' },
    { label: 'Total Transaksi', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
  ] : [];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-hand text-2xl md:text-3xl font-bold text-[#1A1A1A]">Dashboard</h1>
          <p className="text-sm text-gray-500 font-patrick">Ringkasan keuangan & operasional</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-2.5 md:px-3 py-1.5 text-xs font-semibold transition-all ${period === p.key ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={fetchStats} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-white h-24 rounded-xl border border-gray-100" />)}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                    <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
            {/* Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 shadow-sm overflow-hidden">
              <h3 className="font-semibold text-sm text-gray-700 mb-3 md:mb-4">Pemasukan 7 Hari Terakhir</h3>
              {stats?.dailyRevenue && stats.dailyRevenue.length > 0 ? (
                <div className="overflow-x-auto -mx-2">
                  <div className="min-w-[280px] px-2">
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={stats.dailyRevenue.map(d => ({
                        date: new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
                        total: d.total,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => formatRupiah(Number(v) || 0)} />
                        <Bar dataKey="total" fill="#2563EB" radius={[3,3,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : <p className="text-center text-gray-400 py-8 text-sm">Belum ada data</p>}
            </div>

            {/* Top Items */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-700 mb-4">Menu Terlaris (Bulan Ini)</h3>
              {stats?.topItems && stats.topItems.length > 0 ? (
                <div className="space-y-3">
                  {stats.topItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2563EB] rounded-full"
                            style={{ width: `${Math.min(100, (item.total_qty / (stats.topItems[0]?.total_qty || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-gray-700">{item.total_qty}x</p>
                        <p className="text-xs text-gray-400">{formatRupiah(item.total_revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-gray-400 py-8 text-sm">Belum ada data</p>}
            </div>
          </div>

          {/* Payment breakdown */}
          {stats?.paymentBreakdown && stats.paymentBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 shadow-sm mb-4 md:mb-5">
              <h3 className="font-semibold text-sm text-gray-700 mb-3 md:mb-4">Metode Pembayaran</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {stats.paymentBreakdown.map((pm, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-semibold text-sm text-gray-700">{PM_LABELS[pm.payment_method] || pm.payment_method}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{pm.count} transaksi</p>
                    <p className="text-sm font-bold text-[#2563EB] mt-1">{formatRupiah(pm.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-4 md:mt-5">
            {[
              { href: '/admin/cashier', label: '+ Transaksi Baru', color: 'bg-[#1A1A1A] text-white' },
              { href: '/admin/orders', label: 'Lihat Pesanan', color: 'bg-blue-50 text-blue-700' },
              { href: '/admin/expenses', label: 'Catat Pengeluaran', color: 'bg-red-50 text-red-700' },
              { href: '/admin/finance', label: 'Laporan Lengkap', color: 'bg-green-50 text-green-700' },
            ].map((item, i) => (
              <a key={i} href={item.href} className={`${item.color} rounded-lg p-3 text-center text-sm font-semibold hover:opacity-90 transition-opacity`}>
                {item.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

