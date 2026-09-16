import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export default async function PenyeliaDashboard() {
  const session = await getServerSession();
  if (!session?.user?.id) return <div className="p-4">Silakan login</div>;
  const pengajuans = await prisma.pengajuan.findMany({
    where: { userId: session.user.id },
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard Penyelia</h1>
      <ul className="space-y-2">
        {pengajuans.map((p) => (
          <li key={p.id} className="card bg-base-200 p-4">
            <div className="font-bold">{p.companyName}</div>
            <div>Status: {p.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
