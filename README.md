# LPH UNEJ - Sistem Audit Sertifikasi Halal

Sistem manajemen audit sertifikasi halal untuk LPH Universitas Jember.

## Fitur

1. Autentikasi (Login/Register)
2. Dashboard Admin - Statistik pengajuan
3. Form Pengajuan (Pelaku Usaha / SPPG)
4. Daftar Produk & Bahan
5. Implementasi SJPH (5 bagian)
6. Audit Workflow (temuan & verifikasi)
7. Generate Laporan Word (.docx)

## Setup

```bash
npm install
npx prisma migrate dev
node scripts/seed.js
npm run dev
```

## Login

- **Admin**: admin@example.com / password123
- **Penyelia**: Register sendiri

## Stack

- Next.js 16
- Prisma + SQLite
- NextAuth.js
- Tailwind + DaisyUI
- docx (Word generation)
