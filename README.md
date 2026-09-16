# LPH UNEJ - Sistem Audit Sertifikasi Halal

Sistem manajemen audit sertifikasi halal untuk LPH Universitas Jember.

## Fitur Utama

1. **Autentikasi** - Login/Register untuk penyelia dan admin
2. **Dashboard Admin** - Statistik pengajuan (total, menunggu, sedang audit, selesai)
3. **Form Pengajuan** - Buat pengajuan baru (Pelaku Usaha / SPPG)
4. **Daftar Produk** - Input produk yang diajukan
5. **Daftar Bahan** - Input bahan dengan informasi SH (Sertifikat Halal)
6. **Implementasi SJPH** - Checklist 5 bagian:
   - Komitmen dan Tanggung Jawab
   - Bahan
   - Proses Produk Halal
   - Produk
   - Pemantauan dan Evaluasi
7. **Audit Workflow** - Tambah temuan, verifikasi perbaikan
8. **Generate Laporan** - Export Word (.docx)

## Setup

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Seed admin
node scripts/seed.js

# Run
npm run dev
```

## Login

- **Admin**: admin@example.com / password123
- **Penyelia**: Register sendiri

## Stack

- Next.js 16 (App Router)
- Prisma + SQLite
- NextAuth.js
- Tailwind CSS + DaisyUI
- docx (Word generation)
