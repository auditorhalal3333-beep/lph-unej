const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const bcrypt = require('bcryptjs');
const prisma = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN ? new PrismaClient({ adapter: new PrismaLibSQL({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN }) }) : new PrismaClient();
const categories = [
  ['KOMITMEN', 'Komitmen dan Tanggung Jawab', ['Kebijakan Halal', 'Poster Sosialisasi Kebijakan dan Edukasi Halal', 'Surat Keputusan Penetapan Tim Manajemen Halal', 'Sertifikat Penyelia Halal', 'Materi Pelatihan Internal', 'Foto Pelatihan Internal', 'Daftar Hadir Sosialisasi', 'NIB']],
  ['BAHAN', 'Bahan', ['Daftar bahan halal', 'Daftar bahan yang digunakan pada setiap produk', 'Catatan pembelian bahan', 'Bukti nota pembelian bahan', 'Form pemeriksaan bahan', 'Surat pernyataan bebas babi', 'Bukti surat konsistensi bahan']],
  ['PROSES', 'Proses Produk Halal', ['Layout / Denah Ruang Produksi', 'Catatan Penyimpanan Bahan dan Produk', 'Diagram Alir Proses Produksi', 'Catatan Hasil Produksi', 'SOP Penyimpanan Bahan Produksi', 'Video Pencucian Telur', 'Video Pencucian Daging Ayam', 'Video Pencucian Alat Produksi', 'Pernyataan alat produksi tidak bercampur']],
  ['PRODUK', 'Produk', ['Nama produk sesuai', 'Nama produk tidak bermasalah', 'Produk memiliki ketertelusuran', 'Kode produksi jika diperlukan', 'Bukti produk dan kemasan']],
  ['EVALUASI', 'Pemantauan dan Evaluasi', ['Form Daftar Periksa Audit Internal', 'Daftar Hadir Audit Internal', 'Bukti laporan audit internal', 'Bukti evaluasi']],
];
async function main() {
  await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: { role: 'SUPER_ADMIN' }, create: { email: 'admin@example.com', password: await bcrypt.hash('password123', 10), name: 'Super Admin', role: 'SUPER_ADMIN' } });
  await prisma.user.upsert({ where: { email: 'auditor@example.com' }, update: { role: 'AUDITOR' }, create: { email: 'auditor@example.com', password: await bcrypt.hash('password123', 10), name: 'Auditor Demo', role: 'AUDITOR' } });
  await prisma.user.upsert({ where: { email: 'penyelia@example.com' }, update: { role: 'PENYELIA' }, create: { email: 'penyelia@example.com', password: await bcrypt.hash('password123', 10), name: 'Penyelia Demo', role: 'PENYELIA', company: 'Usaha Demo' } });
  for (const [sort, [code, name, criteria]] of categories.entries()) {
    const cat = await prisma.sjphCategory.upsert({ where: { code }, update: { name, sortOrder: sort + 1 }, create: { code, name, sortOrder: sort + 1 } });
    for (const [i, title] of criteria.entries()) await prisma.sjphCriterion.upsert({ where: { categoryId_code: { categoryId: cat.id, code: `${code}-${i + 1}` } }, update: { title, active: true }, create: { categoryId: cat.id, code: `${code}-${i + 1}`, title, evidenceHint: 'Tambahkan tautan bukti yang relevan.', sortOrder: i + 1, type: 'ALL' } });
  }
  console.log('Seeded staging users and SJPH master criteria');
}
main().catch(console.error).finally(() => prisma.$disconnect());
