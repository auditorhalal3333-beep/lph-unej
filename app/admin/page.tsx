import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const total = await prisma.pengajuan.count();
  const waiting = await prisma.pengajuan.count({ where: { status: 'MENUNGGU_AUDIT' } });
  const auditing = await prisma.pengajuan.count({ where: { status: 'SEDANG_DIAUDIT' } });
  const done = await prisma.pengajuan.count({ where: { status: 'SELESAI' } });
  const pengajuans = await prisma.pengajuan.findMany({ include: { user: true } });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-base-200 p-4">
          <div className="text-lg">Total</div>
          <div className="text-3xl font-bold">{total}</div>
        </div>
        <div className="card bg-base-200 p-4">
          <div className="text-lg">Menunggu</div>
          <div className="text-3xl font-bold">{waiting}</div>
        </div>
        <div className="card bg-base-200 p-4">
          <div className="text-lg">Sedang Audit</div>
          <div className="text-3xl font-bold">{auditing}</div>
        </div>
        <div className="card bg-base-200 p-4">
          <div className="text-lg">Selesai</div>
          <div className="text-3xl font-bold">{done}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Daftar Pengajuan</h2>
        {pengajuans.map((p) => (
          <div key={p.id} className="card bg-base-200 p-4 flex justify-between items-center">
            <div>
              <div className="font-bold">{p.companyName}</div>
              <div className="text-sm text-gray-500">{p.type} - {p.user?.name}</div>
            </div>
            <div className="flex gap-2">
              <span className={`badge ${p.status === 'SELESAI' ? 'badge-success' : 'badge-warning'}`}>
                {p.status}
              </span>
              <Link href={`/admin/pengajuan/${p.id}`} className="btn btn-sm btn-primary">Detail</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
