import { Router, Request, Response } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/users.service';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Gagal memuat pengguna' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, password, name, role, is_active } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password, dan nama wajib diisi' });
    }

    const id = await createUser({ username, password, name, role, is_active });
    res.status(201).json({ id, success: true });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message || 'Gagal membuat pengguna' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await updateUser(id, req.body);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message || 'Gagal mengupdate pengguna' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteUser(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message || 'Gagal menghapus pengguna' });
  }
});

export default router;
