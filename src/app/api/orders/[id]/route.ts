import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getWIBDate } from '@/lib/utils';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    // Try by numeric id first, fallback to order_number string
    const isNumeric = /^\d+$/.test(id);
    let query = db.from('orders').select('*');
    query = isNumeric
      ? query.or(`id.eq.${id},order_number.eq.${id}`)
      : query.eq('order_number', id);

    const { data: order, error: orderErr } = await query.single();
    if (orderErr || !order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });

    const { data: items, error: itemsErr } = await db
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsErr) throw itemsErr;
    return NextResponse.json({ ...order, items: items || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const { status, payment_status, payment_method } = body;

    // Ambil data order sekarang
    const { data: order, error: fetchErr } = await db
      .from('orders')
      .select('id, order_number, total, payment_method, payment_status, status')
      .eq('id', Number(id))
      .single();

    if (fetchErr || !order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });

    // Build update payload
    const updatePayload: Record<string, string | number> = {};
    if (status) updatePayload.status = status;
    if (payment_status) updatePayload.payment_status = payment_status;
    if (payment_method) updatePayload.payment_method = payment_method;
    if (payment_status === 'paid') updatePayload.paid_at = new Date().toISOString();

    if (Object.keys(updatePayload).length === 0)
      return NextResponse.json({ error: 'Tidak ada yang diubah' }, { status: 400 });

    const { error: updateErr } = await db
      .from('orders')
      .update(updatePayload)
      .eq('id', Number(id));

    if (updateErr) throw updateErr;

    // ✅ Buat income HANYA saat payment_status berubah ke 'paid'
    if (payment_status === 'paid' && order.payment_status !== 'paid') {
      // Cek jangan dobel
      const { data: existing } = await db
        .from('income')
        .select('id')
        .eq('order_id', order.id)
        .maybeSingle();

      if (!existing) {
        const finalMethod = payment_method || order.payment_method || 'cash';
        const { error: incErr } = await db.from('income').insert({
          order_id: order.id,
          description: `Penjualan Order #${order.order_number}`,
          amount: order.total,
          payment_method: finalMethod,
          category: 'penjualan',
          date: getWIBDate(),
        });
        if (incErr) throw incErr;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
