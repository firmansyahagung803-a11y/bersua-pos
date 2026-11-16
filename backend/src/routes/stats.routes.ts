import { Router, Request, Response } from 'express';
import { getDashboardStats } from '../services/stats.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    const stats = await getDashboardStats(period);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Gagal memuat statistik dashboard' });
  }
});

export default router;
