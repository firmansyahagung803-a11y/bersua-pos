import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { generateOrderNumber, getWIBDate } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const payment_status = searchParams.get('payment_status');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') query = query.eq('status', status);
    if (payment_status) query = query.eq('payment_status', payment_status);
    if (date) {
      // Filter by WIB date using Postgres date casting with timezone
      query = query
        .gte('created_at', `${date}T00:00:00+07:00`)
        .lte('created_at', `${date}T23:59:59+07:00`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { customer_name, customer_phone, table_number, order_type, payment_method, items, notes } =
      await request.json();

    if (!items || items.length === 0)
      return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 });
    if (!customer_name)
      return NextResponse.json({ error: 'Nama pelanggan wajib' }, { status: 400 });

    // Ambil harga menu dari Supabase
    const menuIds = items.map((i: { id: number }) => i.id);
    const { data: menuRows, error: menuErr } = await db
      .from('menu_items')
      .select('id, name, price')
      .in('id', menuIds);
    if (menuErr) throw menuErr;

    let subtotal = 0;
    const resolvedItems = items.map((item: { id: number; quantity: number; notes?: string }) => {
      const menuItem = menuRows?.find((m) => m.id === item.id);
      if (!menuItem) throw new Error(`Menu item ${item.id} tidak ditemukan`);
      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;
      return { ...menuItem, quantity: item.quantity, subtotal: itemSubtotal, notes: item.notes || '' };
    });

    const tax = 0;
    const total = subtotal;
    const order_number = generateOrderNumber();

    // Insert order
    const { data: orderData, error: orderErr } = await db
      .from('orders')
      .insert({
        order_number,
        customer_name,
        customer_phone: customer_phone || '',
        table_number: table_number || '',
        order_type: order_type || 'dine_in',
        payment_method: payment_method || 'cash',
        payment_status: 'unpaid',
        status: 'pending',
        subtotal,
        tax,
        total,
        notes: notes || '',
      })
      .select('id')
      .single();

    if (orderErr) throw orderErr;
    const orderId = orderData.id;

    // Insert order_items
    const orderItems = resolvedItems.map((item: { id: number; name: string; price: number; quantity: number; subtotal: number; notes: string }) => ({
      order_id: orderId,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
      notes: item.notes,
    }));

    const { error: itemsErr } = await db.from('order_items').insert(orderItems);
    if (itemsErr) throw itemsErr;

    return NextResponse.json({ success: true, order_id: orderId, order_number, total });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
