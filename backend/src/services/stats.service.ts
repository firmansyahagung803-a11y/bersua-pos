import getDb from '../db';
import { getWIBDate } from '../utils';

export async function getDashboardStats(period = 'today') {
  const db = getDb();
  const todayWIB = getWIBDate();

  let orderStart: string;
  let orderEnd: string;
  let incStart: string;
  let incEnd: string;

  switch (period) {
    case 'week': {
      const d = new Date(todayWIB);
      d.setDate(d.getDate() - 6);
      const weekStart = d.toISOString().split('T')[0];
      orderStart = `${weekStart}T00:00:00+07:00`;
      orderEnd = `${todayWIB}T23:59:59+07:00`;
      incStart = weekStart;
      incEnd = todayWIB;
      break;
    }
    case 'month': {
      const monthStart = `${todayWIB.slice(0, 7)}-01`;
      orderStart = `${monthStart}T00:00:00+07:00`;
      orderEnd = `${todayWIB}T23:59:59+07:00`;
      incStart = monthStart;
      incEnd = todayWIB;
      break;
    }
    case 'year': {
      const yearStart = `${todayWIB.slice(0, 4)}-01-01`;
      orderStart = `${yearStart}T00:00:00+07:00`;
      orderEnd = `${todayWIB}T23:59:59+07:00`;
      incStart = yearStart;
      incEnd = todayWIB;
      break;
    }
    default: {
      orderStart = `${todayWIB}T00:00:00+07:00`;
      orderEnd = `${todayWIB}T23:59:59+07:00`;
      incStart = todayWIB;
      incEnd = todayWIB;
    }
  }

  const { data: orders } = await db
    .from('orders')
    .select('id, status, payment_status')
    .gte('created_at', orderStart)
    .lte('created_at', orderEnd);

  const allOrders = orders ?? [];
  const totalOrders = allOrders.filter((o) => o.status !== 'cancelled').length;
  const completedOrders = allOrders.filter((o) => o.status === 'completed').length;
  const pendingOrders = allOrders.filter((o) => ['pending', 'processing', 'ready'].includes(o.status)).length;

  const { data: incRows } = await db
    .from('income')
    .select('amount, payment_method, date')
    .gte('date', incStart)
    .lte('date', incEnd);

  const totalIncome = (incRows ?? []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const { data: expRows } = await db
    .from('expenses')
    .select('amount')
    .gte('date', incStart)
    .lte('date', incEnd);

  const totalExpenses = (expRows ?? []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  // Top selling items bulan ini
  const monthStartISO = `${todayWIB.slice(0, 7)}-01T00:00:00+07:00`;
  const { data: monthOrders } = await db
    .from('orders')
    .select('id')
    .gte('created_at', monthStartISO)
    .neq('status', 'cancelled');

  const monthOrderIds = (monthOrders ?? []).map((o) => o.id);

  let topItems: Array<{ name: string; total_qty: number; total_revenue: number }> = [];
  if (monthOrderIds.length > 0) {
    const { data: items } = await db
      .from('order_items')
      .select('name, quantity, subtotal')
      .in('order_id', monthOrderIds);

    const map: Record<string, { total_qty: number; total_revenue: number }> = {};
    for (const item of items ?? []) {
      if (!map[item.name]) map[item.name] = { total_qty: 0, total_revenue: 0 };
      map[item.name].total_qty += Number(item.quantity) || 0;
      map[item.name].total_revenue += Number(item.subtotal) || 0;
    }
    topItems = Object.entries(map)
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 5);
  }

  // Daily revenue 7 hari terakhir
  const d7 = new Date(todayWIB);
  d7.setDate(d7.getDate() - 6);
  const week7Start = d7.toISOString().split('T')[0];

  const { data: week7Inc } = await db
    .from('income')
    .select('date, amount')
    .gte('date', week7Start)
    .lte('date', todayWIB);

  const dayMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayWIB);
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().split('T')[0]] = 0;
  }
  for (const row of week7Inc ?? []) {
    if (dayMap[row.date] !== undefined) {
      dayMap[row.date] += Number(row.amount) || 0;
    }
  }
  const dailyRevenue = Object.entries(dayMap).map(([date, total]) => ({ date, total }));

  // Breakdown metode pembayaran
  const pmMap: Record<string, { count: number; total: number }> = {};
  for (const row of incRows ?? []) {
    const pm = row.payment_method || 'cash';
    if (!pmMap[pm]) pmMap[pm] = { count: 0, total: 0 };
    pmMap[pm].count += 1;
    pmMap[pm].total += Number(row.amount) || 0;
  }
  const paymentBreakdown = Object.entries(pmMap).map(([payment_method, val]) => ({
    payment_method,
    count: val.count,
    total: val.total,
  }));

  return {
    totalOrders,
    completedOrders,
    pendingOrders,
    totalIncome,
    totalExpenses,
    netProfit,
    topItems,
    dailyRevenue,
    paymentBreakdown,
  };
}

