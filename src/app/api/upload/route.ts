import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dapatkan ekstensi file yang sesuai
    const originalExt = file.name.split('.').pop()?.toLowerCase();
    const ext = originalExt && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(originalExt)
      ? originalExt
      : (file.type.split('/')[1] || 'jpg');

    const fileName = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    try {
      const db = getDb();
      const bucketName = 'menu-images';

      const { data, error } = await db.storage
        .from(bucketName)
        .upload(fileName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = db.storage.from(bucketName).getPublicUrl(fileName);
        return NextResponse.json({ url: urlData.publicUrl });
      }
      
      console.warn('Supabase storage upload error, fallback to base64:', error);
    } catch (storageErr) {
      console.warn('Supabase storage exception, fallback to base64:', storageErr);
    }

    // Fallback jika storage bucket bermasalah: simpan sebagai base64 Data URL
    const mime = file.type || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64Data}`;

    return NextResponse.json({ url: dataUrl });
  } catch (err: unknown) {
    console.error('Error handling file upload:', err);
    const msg = err instanceof Error ? err.message : 'Gagal mengunggah gambar';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

