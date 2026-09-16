import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function PengajuanDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pengajuan = await prisma.pengajuan.findUnique({
    where: { id },
    include: { products: true, ingredients: true },
  });

  if (!pengajuan) return <div className="p-4">Pengajuan tidak ditemukan</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">{pengajuan.companyName}</h1>
      <div className="card bg-base-200 p-4">
        <p><strong>Status:</strong> {pengajuan.status}</p>
        <p><strong>Jenis:</strong> {pengajuan.type}</p>
        <p><strong>Pabrik:</strong> {pengajuan.factoryName}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/penyelia/pengajuan/${id}/produk`} className="rounded-xl bg-[#08725b] px-4 py-3 text-xs font-bold text-white">Produk</Link>
        <Link href={`/penyelia/pengajuan/${id}/bahan`} className="rounded-xl bg-[#0a8065] px-4 py-3 text-xs font-bold text-white">Bahan</Link>
        <Link href={`/penyelia/pengajuan/${id}/sjph`} className="rounded-xl bg-[#1c9274] px-4 py-3 text-xs font-bold text-white">Implementasi SJPH</Link>
        <Link href={`/penyelia/pengajuan/${id}/temuan`} className="rounded-xl border border-[#dce9e5] bg-white px-4 py-3 text-xs font-bold text-[#c54b39]">Temuan & Perbaikan</Link>
        <a href={`/api/report/${id}`} className="rounded-xl bg-[#075b49] px-4 py-3 text-xs font-bold text-white">Download Laporan</a>
      </div>
    </div>
  );
}
