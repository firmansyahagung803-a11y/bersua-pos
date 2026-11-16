import { Router, Request, Response } from 'express';
import { loginUser } from '../services/auth.service';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const user = await loginUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

export default router;
