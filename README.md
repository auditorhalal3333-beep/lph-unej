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

## Setup lokal

```bash
npm install
npx prisma db push
node scripts/seed.js
npm run dev
```

Local development uses SQLite through `DATABASE_URL` in `.env.local`.

## Staging Turso + Vercel

The deployed staging environment uses Prisma with the libSQL adapter. Configure these environment variables in Vercel; never commit their values:

- `TURSO_DATABASE_URL` — URL database Turso
- `TURSO_AUTH_TOKEN` — token database Turso
- `DATABASE_URL` — same Turso URL for Prisma schema tooling
- `NEXTAUTH_SECRET` — secret acak untuk session NextAuth

Initialize a fresh staging database from the schema SQL, then seed it:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > /tmp/lph-schema.sql
turso db shell <nama-database> < /tmp/lph-schema.sql
TURSO_DATABASE_URL=<url> TURSO_AUTH_TOKEN=<token> node scripts/seed.js
```

Laporan sistem tetap menghasilkan Microsoft Word (`.docx`). PDF bukan output utama.

## Login demo staging

- **Admin**: `admin@example.com` / `password123`
- **Auditor**: `auditor@example.com` / `password123`
- **Penyelia**: `penyelia@example.com` / `password123`

## Stack

- Next.js 16
- Prisma + SQLite
- NextAuth.js
- Tailwind + DaisyUI
- docx (Word generation)
