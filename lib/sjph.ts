import { prisma } from './prisma';

const categories = [
  { code: 'KOMITMEN', name: 'Komitmen dan Tanggung Jawab', sortOrder: 1, criteria: ['Kebijakan Halal', 'Poster Sosialisasi Kebijakan dan Edukasi Halal', 'Surat Keputusan Penetapan Tim Manajemen Halal', 'Sertifikat Penyelia Halal', 'Materi Pelatihan Internal', 'Foto Pelatihan Internal', 'Daftar Hadir Sosialisasi', 'NIB'] },
  { code: 'BAHAN', name: 'Bahan', sortOrder: 2, criteria: ['Daftar bahan halal', 'Daftar bahan yang digunakan pada setiap produk', 'Catatan pembelian bahan', 'Bukti nota pembelian bahan', 'Form pemeriksaan bahan', 'Surat pernyataan bebas babi', 'Bukti surat konsistensi bahan'] },
  { code: 'PROSES', name: 'Proses Produk Halal', sortOrder: 3, criteria: ['Layout / Denah Ruang Produksi', 'Catatan Penyimpanan Bahan dan Produk', 'Diagram Alir Proses Produksi', 'Catatan Hasil Produksi', 'SOP Penyimpanan Bahan Produksi', 'Video Pencucian Telur', 'Video Pencucian Daging Ayam', 'Video Pencucian Alat Produksi', 'Pernyataan alat produksi tidak bercampur'] },
  { code: 'PRODUK', name: 'Produk', sortOrder: 4, criteria: ['Nama produk sesuai', 'Nama produk tidak bermasalah', 'Produk memiliki ketertelusuran', 'Kode produksi jika diperlukan', 'Bukti produk dan kemasan'] },
  { code: 'EVALUASI', name: 'Pemantauan dan Evaluasi', sortOrder: 5, criteria: ['Form Daftar Periksa Audit Internal', 'Daftar Hadir Audit Internal', 'Bukti laporan audit internal', 'Bukti evaluasi'] },
];

export async function seedSjphCriteria() {
  for (const category of categories) {
    const saved = await prisma.sjphCategory.upsert({ where: { code: category.code }, update: { name: category.name, sortOrder: category.sortOrder }, create: { code: category.code, name: category.name, sortOrder: category.sortOrder } });
    for (const [index, title] of category.criteria.entries()) {
      await prisma.sjphCriterion.upsert({ where: { categoryId_code: { categoryId: saved.id, code: `${category.code}-${index + 1}` } }, update: { title, evidenceHint: 'Tambahkan tautan bukti yang relevan.', sortOrder: index + 1 }, create: { categoryId: saved.id, code: `${category.code}-${index + 1}`, title, evidenceHint: 'Tambahkan tautan bukti yang relevan.', sortOrder: index + 1, type: 'ALL' } });
    }
  }
}

export async function getCriteriaForType(type: string) {
  return prisma.sjphCategory.findMany({ where: { active: true }, include: { criteria: { where: { active: true, OR: [{ type: 'ALL' }, { type }] }, orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } });
}
