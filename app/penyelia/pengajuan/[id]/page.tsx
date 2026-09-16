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

      <div className="flex gap-4">
        <Link href={`/penyelia/pengajuan/${id}/produk`} className="btn btn-primary">Produk</Link>
        <Link href={`/penyelia/pengajuan/${id}/bahan`} className="btn btn-secondary">Bahan</Link>
        <Link href={`/penyelia/pengajuan/${id}/sjph`} className="btn btn-accent">SJPH</Link>
      </div>
    </div>
  );
}
