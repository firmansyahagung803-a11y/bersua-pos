# ☕ BERSUA Backend API Server

Folder ini merupakan **Backend Service** mandiri untuk BERSUA Coffee & Eatery POS.

## 🛠️ Tech Stack
- **Runtime:** Node.js & TypeScript
- **Framework:** Express.js
- **Database:** Supabase PostgreSQL & Storage
- **Authentication:** Bcrypt.js
- **File Upload:** Multer

## 📂 Struktur Folder
```
backend/
├── src/
│   ├── routes/          # Express route handlers
│   │   ├── auth.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── finance.routes.ts
│   │   ├── menu.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── stats.routes.ts
│   │   ├── upload.routes.ts
│   │   └── users.routes.ts
│   ├── services/        # Business logic & Supabase queries
│   │   ├── auth.service.ts
│   │   ├── categories.service.ts
│   │   ├── finance.service.ts
│   │   ├── menu.service.ts
│   │   ├── orders.service.ts
│   │   ├── stats.service.ts
│   │   └── users.service.ts
│   ├── db.ts            # Supabase Client Singleton
│   ├── types.ts         # Backend Data Models
│   ├── utils.ts         # WIB Time & Order Generator
│   └── server.ts        # Express Entry Point
├── .env.example
├── package.json
└── tsconfig.json
```

## 🚀 Cara Menjalankan Backend
1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Install dependency:
   ```bash
   npm install
   ```
3. Salin file environment:
   ```bash
   cp .env.example .env
   ```
4. Jalankan mode development:
   ```bash
   npm run dev
   ```
Server akan berjalan di `http://localhost:5000`.
