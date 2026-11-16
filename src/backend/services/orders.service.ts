import getDb from '@/backend/db';
import { generateOrderNumber, getWIBDate, getWIBDateTime } from '@/lib/utils';
import { Order, OrderItem } from '@/backend/types';

interface OrderFilters {
  status?: string | null;
  payment_status?: string | null;
  date?: string | null;
  limit?: number;
  offset?: number;
}

export async function getOrders(filters: OrderFilters = {}): Promise<Order[]> {
  const db = getDb();
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  let query = db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.payment_status && filters.payment_status !== 'all') query = query.eq('payment_status', filters.payment_status);
  if (filters.date) {
    query = query
      .gte('created_at', `${filters.date}T00:00:00+07:00`)
      .lte('created_at', `${filters.date}T23:59:59+07:00`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getOrderById(id: string | number): Promise<Order | null> {
  const db = getDb();
  const isNum = !isNaN(Number(id));

  let orderQuery = db.from('orders').select('*');
  if (isNum) {
    orderQuery = orderQuery.or(`id.eq.${id},order_number.eq.${id}`);
  } else {
    orderQuery = orderQuery.eq('order_number', id);
  }

  const { data: order, error } = await orderQuery.single();
  if (error || !order) return null;

  const { data: items } = await db
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  return { ...order, items: items || [] };
}

export async function createOrder(payload: {
  customer_name: string;
  customer_phone?: string;
  table_number?: string;
  order_type?: 'dine_in' | 'takeaway';
  payment_method?: string;
  notes?: string;
  items: Array<{ id: number; quantity: number; notes?: string }>;
}) {
  const { customer_name, customer_phone, table_number, order_type, payment_method, items, notes } = payload;
  if (!items || items.length === 0) throw new Error('Keranjang kosong');
  if (!customer_name) throw new Error('Nama pelanggan wajib');

  const db = getDb();
  const menuIds = items.map((i) => i.id);
  const { data: menuRows, error: menuErr } = await db
    .from('menu_items')
    .select('id, name, price')
    .in('id', menuIds);

  if (menuErr) throw menuErr;

  let subtotal = 0;
  const resolvedItems = items.map((item) => {
    const menuItem = menuRows?.find((m) => m.id === item.id);
    if (!menuItem) throw new Error(`Menu item ${item.id} tidak ditemukan`);
    const itemSubtotal = menuItem.price * item.quantity;
    subtotal += itemSubtotal;
    return { ...menuItem, quantity: item.quantity, subtotal: itemSubtotal, notes: item.notes || '' };
  });

  const tax = 0; // Bebas pajak
  const total = subtotal;
  const order_number = generateOrderNumber();

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

  const orderItems = resolvedItems.map((item) => ({
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

  return { success: true, order_id: orderId, order_number, total };
}

export async function updateOrder(id: number, updates: Partial<{
  status: string;
  payment_status: string;
  payment_method: string;
}>) {
  const db = getDb();
  const { data: currentOrder, error: fetchErr } = await db
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !currentOrder) throw new Error('Order tidak ditemukan');

  const nowWIB = getWIBDateTime();
  const dateWIB = getWIBDate();

  const patchData: Record<string, unknown> = {};
  if (updates.status) patchData.status = updates.status;
  if (updates.payment_status) patchData.payment_status = updates.payment_status;
  if (updates.payment_method) patchData.payment_method = updates.payment_method;

  if (updates.payment_status === 'paid') {
    patchData.paid_at = nowWIB;
  }

  const { error: updateErr } = await db.from('orders').update(patchData).eq('id', id);
  if (updateErr) throw updateErr;

  // Catat income otomatis saat payment_status berubah ke 'paid'
  if (updates.payment_status === 'paid' && currentOrder.payment_status !== 'paid') {
    const { data: existingIncome } = await db
      .from('income')
      .select('id')
      .eq('order_id', currentOrder.id)
      .maybeSingle();

    if (!existingIncome) {
      const finalPaymentMethod = updates.payment_method || currentOrder.payment_method || 'cash';
      await db.from('income').insert({
        order_id: currentOrder.id,
        description: `Penjualan Order #${currentOrder.order_number}`,
        amount: currentOrder.total,
        payment_method: finalPaymentMethod,
        category: 'penjualan',
        date: dateWIB,
      });
    }
  }

  return { success: true };
}
