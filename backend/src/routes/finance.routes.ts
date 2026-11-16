import { Router, Request, Response } from 'express';
import {
  getIncomeList,
  createIncome,
  getExpenseList,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/finance.service';

const router = Router();

// Income routes
router.get('/income', async (req: Request, res: Response) => {
  try {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const data = await getIncomeList({ from, to, limit });
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: 'Gagal memuat pemasukan' });
  }
});

router.post('/income', async (req: Request, res: Response) => {
  try {
    const { description, amount, payment_method, category, date } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ error: 'Deskripsi dan jumlah pemasukan wajib diisi' });
    }

    const id = await createIncome({
      description,
      amount: Number(amount),
      payment_method,
      category,
      date,
    });
    res.status(201).json({ id, success: true });
  } catch (error: any) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: 'Gagal mencatat pemasukan' });
  }
});

// Expense routes
router.get('/expenses', async (req: Request, res: Response) => {
  try {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const data = await getExpenseList({ from, to, category, limit });
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Gagal memuat pengeluaran' });
  }
});

router.get('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await getExpenseById(id);
    if (!item) return res.status(404).json({ error: 'Pengeluaran tidak ditemukan' });
    res.json(item);
  } catch (error: any) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Gagal memuat detail pengeluaran' });
  }
});

router.post('/expenses', async (req: Request, res: Response) => {
  try {
    const { description, amount, category, date, notes } = req.body;
    if (!description || !amount || !category) {
      return res.status(400).json({ error: 'Deskripsi, jumlah, dan kategori wajib diisi' });
    }

    const id = await createExpense({
      description,
      amount: Number(amount),
      category,
      date,
      notes,
    });
    res.status(201).json({ id, success: true });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Gagal mencatat pengeluaran' });
  }
});

router.put('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await updateExpense(id, req.body);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Gagal mengupdate pengeluaran' });
  }
});

router.delete('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteExpense(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Gagal menghapus pengeluaran' });
  }
});

export default router;
