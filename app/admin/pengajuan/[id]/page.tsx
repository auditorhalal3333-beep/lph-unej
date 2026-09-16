import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminPengajuanDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pengajuan = await prisma.pengajuan.findUnique({
    where: { id },
    include: { products: true, ingredients: true, temuan: true },
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
        <Link href={`/admin/pengajuan/${id}/audit`} className="btn btn-primary">Audit</Link>
        <a href={`/api/report/${id}`} className="btn btn-secondary">Download Laporan</a>
      </div>
    </div>
  );
}
