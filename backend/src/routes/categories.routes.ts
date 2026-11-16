import { Router, Request, Response } from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categories.service';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Gagal memuat kategori' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, slug, icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi' });
    }
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await createCategory(name, finalSlug, icon || '☕');
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Gagal membuat kategori' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, slug, icon } = req.body;
    const category = await updateCategory(id, { name, slug, icon });
    res.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Gagal mengupdate kategori' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteCategory(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Gagal menghapus kategori' });
  }
});

export default router;
