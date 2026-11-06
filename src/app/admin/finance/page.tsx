'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatRupiah } from '@/lib/utils';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';

interface DailyData {
  date: string;
  income: number;
  expense: number;
  profit: number;
}

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  dailyData: DailyData[];
  incomeByPayment: { payment_method: string; total: number }[];
  expenseByCategory: { category: string; total: number }[];
}

const EXPENSE_LABEL: Record<string, string> = {
  bahan_baku: 'Bahan Baku', gaji: 'Gaji', sewa: 'Sewa', utilitas: 'Utilitas',
  peralatan: 'Peralatan', operasional: 'Operasional', marketing: 'Marketing', lainnya: 'Lainnya',
};
const PM_LABEL: Record<string, string> = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer', debit: 'Debit' };

export default function FinancePage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const [incRes, expRes] = await Promise.all([
      fetch(`/api/income?from=${from}&to=${to}&limit=500`),
      fetch(`/api/expenses?from=${from}&to=${to}&limit=500`),
    ]);
    const [incData, expData] = await Promise.all([incRes.json(), expRes.json()]);

    const incomeArr: { date: string; amount: number; payment_method: string }[] = Array.isArray(incData) ? incData : [];
    const expenseArr: { date: string; amount: number; category: string }[] = Array.isArray(expData) ? expData : [];

    const totalIncome = incomeArr.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenseArr.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    // Build daily data
    const daysMap: Record<string, { income: number; expense: number }> = {};
    const start = new Date(from);
    const end = new Date(to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      daysMap[d.toISOString().split('T')[0]] = { income: 0, expense: 0 };
    }
    incomeArr.forEach(i => { if (daysMap[i.date]) daysMap[i.date].income += i.amount; });
    expenseArr.forEach(e => { if (daysMap[e.date]) daysMap[e.date].expense += e.amount; });

    const dailyData: DailyData[] = Object.entries(daysMap).map(([date, v]) => ({
      date,
      income: v.income,
      expense: v.expense,
      profit: v.income - v.expense,
    })).slice(-30); // max 30 days

    // Payment breakdown
    const pmMap: Record<string, number> = {};
    incomeArr.forEach(i => { pmMap[i.payment_method] = (pmMap[i.payment_method] || 0) + i.amount; });
    const incomeByPayment = Object.entries(pmMap).map(([k, v]) => ({ payment_method: k, total: v }));

    // Expense by category
    const catMap: Record<string, number> = {};
    expenseArr.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
    const expenseByCategory = Object.entries(catMap).map(([k, v]) => ({ category: k, total: v }));

    setReport({ totalIncome, totalExpenses, netProfit, dailyData, incomeByPayment, expenseByCategory });
    setLoading(false);
  }, [from, to]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const formatShortDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate()}/${dt.getMonth()+1}`;
  };

  const printReport = () => window.print();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="font-hand text-3xl font-bold text-[#1A1A1A]">Laporan Keuangan</h1>
        <button onClick={printReport} className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export / Print
        </button>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-3 mb-6 flex-wrap bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Dari:</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Sampai:</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Hari Ini', days: 0 },
            { label: '7 Hari', days: 7 },
            { label: 'Bulan Ini', days: -1 },
          ].map(({ label, days }) => (
            <button
              key={label}
              onClick={() => {
                const today = new Date();
                const toStr = today.toISOString().split('T')[0];
                if (days === -1) {
                  const f = new Date(today.getFullYear(), today.getMonth(), 1);
                  setFrom(f.toISOString().split('T')[0]);
                } else {
                  const f = new Date(today);
                  f.setDate(f.getDate() - days);
                  setFrom(f.toISOString().split('T')[0]);
                }
                setTo(toStr);
              }}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-xl" />)}
        </div>
      ) : report && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl border border-green-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-700">Total Pemasukan</p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{formatRupiah(report.totalIncome)}</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">Total Pengeluaran</p>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-700">{formatRupiah(report.totalExpenses)}</p>
            </div>
            <div className={`rounded-xl border p-5 ${report.netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-medium ${report.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Laba Bersih</p>
                <DollarSign className={`w-5 h-5 ${report.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
              <p className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {formatRupiah(report.netProfit)}
              </p>
            </div>
          </div>

          {/* Revenue vs Expense chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
            <h3 className="font-semibold text-sm text-gray-700 mb-4">Pemasukan vs Pengeluaran</h3>
            {report.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report.dailyData.map(d => ({ ...d, date: formatShortDate(d.date) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatRupiah(Number(v) || 0)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="income" name="Pemasukan" fill="#16A34A" radius={[3,3,0,0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#DC2626" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center py-8 text-gray-400 text-sm">Tidak ada data</p>}
          </div>

          {/* Profit line */}
          {report.dailyData.some(d => d.profit !== 0) && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-700 mb-4">Tren Laba Bersih Harian</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={report.dailyData.map(d => ({ ...d, date: formatShortDate(d.date) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatRupiah(Number(v) || 0)} />
                  <Line dataKey="profit" name="Laba Bersih" stroke="#2563EB" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Breakdown tables */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Income by payment */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Pemasukan per Metode</h3>
              <div className="space-y-2">
                {report.incomeByPayment.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-700">{PM_LABEL[item.payment_method] || item.payment_method}</span>
                    <span className="font-semibold text-green-600 text-sm">{formatRupiah(item.total)}</span>
                  </div>
                ))}
                {report.incomeByPayment.length === 0 && <p className="text-gray-400 text-sm py-4 text-center">Tidak ada data</p>}
              </div>
            </div>

            {/* Expense by category */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Pengeluaran per Kategori</h3>
              <div className="space-y-2">
                {report.expenseByCategory.sort((a,b) => b.total - a.total).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-700">{EXPENSE_LABEL[item.category] || item.category}</span>
                    <span className="font-semibold text-red-600 text-sm">{formatRupiah(item.total)}</span>
                  </div>
                ))}
                {report.expenseByCategory.length === 0 && <p className="text-gray-400 text-sm py-4 text-center">Tidak ada data</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
