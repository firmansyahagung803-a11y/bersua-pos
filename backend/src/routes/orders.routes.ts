import { Router, Request, Response } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
} from '../services/orders.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const payment_status = req.query.payment_status as string | undefined;
    const date = req.query.date as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const orders = await getOrders({ status, payment_status, date, limit });
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Gagal memuat pesanan' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }
    res.json(order);
  } catch (error: any) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ error: 'Gagal memuat detail pesanan' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_phone,
      table_number,
      order_type,
      payment_method,
      notes,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Pesanan harus memiliki minimal 1 item' });
    }
    if (!customer_name) {
      return res.status(400).json({ error: 'Nama pelanggan wajib diisi' });
    }

    const order = await createOrder({
      customer_name,
      customer_phone,
      table_number,
      order_type,
      payment_method,
      notes,
      items,
    });

    res.status(201).json(order);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Gagal membuat pesanan' });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, payment_status, payment_method } = req.body;

    const result = await updateOrder(id, { status, payment_status, payment_method });
    res.json(result);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message || 'Gagal mengubah status pesanan' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await updateOrder(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message || 'Gagal mengupdate pesanan' });
  }
});

export default router;
