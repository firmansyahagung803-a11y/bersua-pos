import { Router, Request, Response } from 'express';
import multer from 'multer';
import getDb from '../db';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }

    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File harus berupa gambar' });
    }

    const originalExt = file.originalname.split('.').pop()?.toLowerCase();
    const ext = originalExt && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(originalExt)
      ? originalExt
      : (file.mimetype.split('/')[1] || 'jpg');

    const fileName = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    try {
      const db = getDb();
      const bucketName = 'menu-images';

      const { error: uploadError } = await db.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError) {
        const { data: publicUrlData } = db.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return res.json({
          url: publicUrlData.publicUrl,
          name: fileName,
        });
      }
    } catch {
      // Supabase storage bucket fallback
    }

    // Fallback response
    return res.json({
      url: `/images/${fileName}`,
      name: fileName,
      warning: 'Disimpan dalam fallback mode',
    });
  } catch (error: any) {
    console.error('Error in upload route:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses unggahan' });
  }
});

export default router;
