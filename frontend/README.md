# ☕ BERSUA Frontend (Next.js)

Folder ini merupakan **Frontend Application** mandiri untuk BERSUA Coffee & Eatery POS & Dashboard.

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19 & TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Icons & UI:** Lucide React & Framer Motion
- **Charts:** Recharts

## 📂 Struktur Folder
```
frontend/
├── public/              # Gambar produk & aset publik
│   └── images/
├── src/
│   ├── app/             # Halaman-halaman Next.js
│   │   ├── about/       # Halaman Tentang Kami
│   │   ├── admin/       # Dashboard Admin, Kasir, Menu, Keuangan, Laporan
│   │   ├── cart/        # Keranjang belanja
│   │   ├── checkout/    # Checkout pesanan
│   │   ├── menu/        # Daftar Menu & Filter Kategori
│   │   ├── order/       # Tracking status pesanan
│   │   ├── layout.tsx
│   │   └── page.tsx     # Homepage POS
│   ├── components/      # Komponen UI (Navbar, LiveClock)
│   ├── store/           # Zustand Store (Cart)
│   └── utils/           # Helper format Rupiah, format tanggal WIB
├── .env.local           # Environment konfigurasi frontend
├── next.config.ts       # Proxy rewrite otomatis ke Backend API (:5000)
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## 🚀 Cara Menjalankan Frontend
1. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Jalankan mode development:
   ```bash
   npm run dev
   ```
Aplikasi frontend akan berjalan di `http://localhost:3000`.
Semua panggilan `/api/*` secara otomatis diarahkan ke backend (`http://localhost:5000/api/*`).
