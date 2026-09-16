import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const total = await prisma.pengajuan.count();
  const waiting = await prisma.pengajuan.count({ where: { status: 'MENUNGGU_AUDIT' } });
  const auditing = await prisma.pengajuan.count({ where: { status: 'SEDANG_DIAUDIT' } });
  const done = await prisma.pengajuan.count({ where: { status: 'SELESAI' } });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard LPH</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-base-200 p-4">
          <div className="text-lg">Total Pengajuan</div>
          <div className="text-3xl font-bold">{total}</div>
        </div>
        <div className="card bg-base-200 p-4">
          <div className="text-lg">Menunggu Audit</div>
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
    </div>
  );
}
