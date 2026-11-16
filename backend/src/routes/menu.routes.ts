import { Router, Request, Response } from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../services/menu.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category_id ? String(req.query.category_id) : undefined;
    const featured = req.query.featured ? String(req.query.featured) : undefined;
    const search = req.query.search as string | undefined;

    const items = await getMenuItems({
      category,
      featured,
      search,
    });
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Gagal memuat menu' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await getMenuItemById(id);
    if (!item) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    res.json(item);
  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Gagal memuat detail menu' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category_id, price, description, image_url, is_available, is_featured } = req.body;
    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Nama, kategori, dan harga wajib diisi' });
    }

    const item = await createMenuItem({
      name,
      category_id: Number(category_id),
      price: Number(price),
      description,
      image_url,
      is_available: is_available !== undefined ? Number(is_available) : 1,
      is_featured: is_featured !== undefined ? Number(is_featured) : 0,
    });

    res.status(201).json(item);
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Gagal membuat menu' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await updateMenuItem(id, req.body);
    res.json(item);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Gagal mengupdate menu' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteMenuItem(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Gagal menghapus menu' });
  }
});

export default router;
