'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatRupiah, formatDateTime, PAYMENT_METHOD_LABEL } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface Income {
  id: number;
  order_id: number;
  description: string;
  amount: number;
  payment_method: string;
  category: string;
  date: string;
  created_at: string;
}

export default function IncomePage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);

  const fetchIncome = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);
    const res = await fetch(`/api/income?${params}`);
    const data = await res.json();
    setIncome(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filterFrom, filterTo]);

  useEffect(() => { fetchIncome(); }, [fetchIncome]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-hand text-3xl font-bold text-[#1A1A1A]">Pemasukan</h1>
          <p className="text-sm text-gray-500">Total ditampilkan: <strong className="text-green-600">{formatRupiah(totalIncome)}</strong></p>
        </div>
        <button onClick={fetchIncome} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Dari:</label>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Sampai:</label>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        {(filterFrom || filterTo) && (
          <button onClick={() => { setFilterFrom(''); setFilterTo(''); }} className="text-sm text-red-500 hover:text-red-700">Reset</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Waktu</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Deskripsi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Metode</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Kategori</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5}><div className="animate-pulse bg-gray-100 h-4 m-4 rounded" /></td></tr>
              )) : income.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Belum ada pemasukan</td></tr>
              ) : income.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(item.created_at)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{item.description}</p>
                    {item.order_id && <p className="text-xs text-gray-400">Order #{item.order_id}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {PAYMENT_METHOD_LABEL[item.payment_method] || item.payment_method}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full capitalize">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{formatRupiah(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            {income.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-100">
                <tr>
                  <td colSpan={4} className="px-4 py-3 font-semibold text-gray-700">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700 text-base">{formatRupiah(totalIncome)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

