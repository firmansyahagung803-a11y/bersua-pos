# ☕ BERSUA Coffee & Eatery POS Monorepo

Sistem Point of Sale (POS) dan Manajemen Restoran / Kafe BERSUA berbasis arsitektur terpisah antara **Backend** dan **Frontend**.

---

## 🏗️ Struktur Arsitektur

```
bersua-app/
│
├── 📂 backend/               # Server API Mandiri (Express.js & Supabase)
│   ├── src/
│   │   ├── routes/          # Endpoint API Express (Auth, Menu, Orders, Finance, Stats, dll)
│   │   ├── services/        # Logika Bisnis & Query Database Supabase
│   │   ├── db.ts            # Supabase Client Singleton
│   │   ├── types.ts         # Data Model & Tipe TypeScript
│   │   ├── utils.ts         # Helper Waktu WIB & Generator Nomor Order
│   │   └── server.ts        # Entry point server Express (Port 5000)
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── 📂 frontend/              # Client Application Mandiri (Next.js 16)
    ├── public/              # Gambar Menu & Aset Statis
    │   └── images/
    ├── src/
    │   ├── app/             # Halaman Web (Home, Menu, Admin, Cart, Checkout, Order, dll)
    │   ├── components/      # Komponen UI (Navbar, LiveClock)
    │   ├── store/           # Global State Zustand (Keranjang Belanja)
    │   └── utils/           # Helper Format Rupiah & Format Tanggal WIB
    ├── .env.local
    ├── next.config.ts       # Reverse proxy otomatis ke Backend (:5000)
    ├── package.json
    ├── postcss.config.mjs
    ├── tsconfig.json
    └── README.md
```

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Menjalankan Backend API Server (Port 5000)
```bash
# Dari root project:
npm run dev:backend

# Atau langsung masuk ke folder backend:
cd backend
npm install
npm run dev
```
Backend akan aktif di `http://localhost:5000`.

### 2. Menjalankan Frontend Next.js (Port 3000)
```bash
# Dari root project:
npm run dev:frontend

# Atau langsung masuk ke folder frontend:
cd frontend
npm run dev
```
Frontend akan aktif di `http://localhost:3000`.

---

## 🗄️ Database
- Database menggunakan **Supabase PostgreSQL**.
- Data gambar menu tersimpan di `frontend/public/images/` dan Supabase Storage bucket `menu-images`.
