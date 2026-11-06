import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getWIBDate } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    const todayWIB = getWIBDate(); // YYYY-MM-DD

    // ── Hitung date range berdasarkan period ───────────────────
    let orderStart: string; // ISO timestamp WIB start
    let orderEnd: string;   // ISO timestamp WIB end
    let incStart: string;   // date string YYYY-MM-DD
    let incEnd: string;

    switch (period) {
      case 'week': {
        const d = new Date(todayWIB);
        d.setDate(d.getDate() - 6);
        const weekStart = d.toISOString().split('T')[0];
        orderStart = `${weekStart}T00:00:00+07:00`;
        orderEnd   = `${todayWIB}T23:59:59+07:00`;
        incStart   = weekStart;
        incEnd     = todayWIB;
        break;
      }
      case 'month': {
        const monthStart = `${todayWIB.slice(0, 7)}-01`;
        orderStart = `${monthStart}T00:00:00+07:00`;
        orderEnd   = `${todayWIB}T23:59:59+07:00`;
        incStart   = monthStart;
        incEnd     = todayWIB;
        break;
      }
      case 'year': {
        const yearStart = `${todayWIB.slice(0, 4)}-01-01`;
        orderStart = `${yearStart}T00:00:00+07:00`;
        orderEnd   = `${todayWIB}T23:59:59+07:00`;
        incStart   = yearStart;
        incEnd     = todayWIB;
        break;
      }
      default: // 'today'
        orderStart = `${todayWIB}T00:00:00+07:00`;
        orderEnd   = `${todayWIB}T23:59:59+07:00`;
        incStart   = todayWIB;
        incEnd     = todayWIB;
    }

    // ── Fetch orders dalam range ───────────────────────────────
    const { data: orders } = await db
      .from('orders')
      .select('id, status, payment_status')
      .gte('created_at', orderStart)
      .lte('created_at', orderEnd);

    const allOrders = orders ?? [];
    const totalOrders      = allOrders.filter(o => o.status !== 'cancelled').length;
    const completedOrders  = allOrders.filter(o => o.status === 'completed').length;
    const pendingOrders    = allOrders.filter(o => ['pending', 'processing', 'ready'].includes(o.status)).length;

    // ── Income & Expenses ──────────────────────────────────────
    const { data: incomeRows } = await db
      .from('income')
      .select('amount, payment_method, date')
      .gte('date', incStart)
      .lte('date', incEnd);

    const { data: expenseRows } = await db
      .from('expenses')
      .select('amount')
      .gte('date', incStart)
      .lte('date', incEnd);

    const totalIncome   = (incomeRows ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
    const totalExpenses = (expenseRows ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
    const netProfit     = totalIncome - totalExpenses;

    // ── Top selling items bulan ini ────────────────────────────
    const monthStart = `${todayWIB.slice(0, 7)}-01`;
    const { data: monthOrders } = await db
      .from('orders')
      .select('id')
      .gte('created_at', `${monthStart}T00:00:00+07:00`)
      .lte('created_at', `${todayWIB}T23:59:59+07:00`)
      .neq('status', 'cancelled');

    const monthOrderIds = (monthOrders ?? []).map(o => o.id);
    let topItems: { name: string; total_qty: number; total_revenue: number }[] = [];

    if (monthOrderIds.length > 0) {
      const { data: itemRows } = await db
        .from('order_items')
        .select('name, quantity, subtotal')
        .in('order_id', monthOrderIds);

      // Aggregate in JS
      const itemMap = new Map<string, { total_qty: number; total_revenue: number }>();
      for (const row of itemRows ?? []) {
        const prev = itemMap.get(row.name) ?? { total_qty: 0, total_revenue: 0 };
        itemMap.set(row.name, {
          total_qty: prev.total_qty + row.quantity,
          total_revenue: prev.total_revenue + row.subtotal,
        });
      }
      topItems = Array.from(itemMap.entries())
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.total_qty - a.total_qty)
        .slice(0, 5);
    }

    // ── Daily revenue 7 hari terakhir ─────────────────────────
    const d7 = new Date(todayWIB);
    d7.setDate(d7.getDate() - 6);
    const week7Start = d7.toISOString().split('T')[0];

    const { data: dailyRows } = await db
      .from('income')
      .select('date, amount')
      .gte('date', week7Start)
      .lte('date', todayWIB);

    // Group by date
    const dailyMap = new Map<string, number>();
    for (const row of dailyRows ?? []) {
      dailyMap.set(row.date, (dailyMap.get(row.date) ?? 0) + row.amount);
    }
    const dailyRevenue = Array.from(dailyMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── Payment breakdown ──────────────────────────────────────
    const pmMap = new Map<string, { count: number; total: number }>();
    for (const row of incomeRows ?? []) {
      const pm = row.payment_method ?? 'cash';
      const prev = pmMap.get(pm) ?? { count: 0, total: 0 };
      pmMap.set(pm, { count: prev.count + 1, total: prev.total + row.amount });
    }
    const paymentBreakdown = Array.from(pmMap.entries()).map(([payment_method, v]) => ({
      payment_method,
      ...v,
    }));

    return NextResponse.json({
      totalOrders,
      completedOrders,
      pendingOrders,
      totalIncome,
      totalExpenses,
      netProfit,
      topItems,
      dailyRevenue,
      paymentBreakdown,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
