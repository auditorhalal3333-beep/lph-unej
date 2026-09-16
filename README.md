# LPH UNEJ

Sistem Audit Sertifikasi Halal untuk LPH Universitas Jember

## Fitur

- Autentikasi pengguna (Super Admin, Admin, Penyelia)
- Dashboard statistik pengajuan
- Form pengajuan sertifikasi halal (Pelaku Usaha & SPPG)
- Manajemen bahan dan produk
- Checklist SJPH
- Audit workflow dengan temuan
- Generate laporan Word (.docx)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup database:
   ```bash
   npx prisma migrate dev
   ```

3. Seed admin:
   ```bash
   node scripts/seed.js
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

## Default Login

- Email: admin@example.com
- Password: password123

## Stack

- Next.js 14 (App Router)
- Prisma + SQLite
- NextAuth.js
- Tailwind CSS + DaisyUI
- docx (Word generation)
