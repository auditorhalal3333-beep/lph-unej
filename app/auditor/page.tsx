import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ArrowRight, ClipboardCheck, Clock3, FileWarning, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const statusLabel: Record<string, string> = {
  MENUNGGU_AUDITOR: 'Menunggu dimulai',
  SEDANG_DIAUDIT: 'Sedang diaudit',
  PERLU_PERBAIKAN: 'Perlu perbaikan',
  MENUNGGU_VERIFIKASI: 'Menunggu verifikasi',
  SELESAI: 'Selesai',
};
const statusStyle: Record<string, string> = {
  MENUNGGU_AUDITOR: 'bg-[#fff4d7] text-[#a66a00]',
  SEDANG_DIAUDIT: 'bg-[#e7f5ef] text-[#08725b]',
  PERLU_PERBAIKAN: 'bg-[#ffe6e2] text-[#c54b39]',
  MENUNGGU_VERIFIKASI: 'bg-[#e4f1ff] text-[#337bc0]',
  SELESAI: 'bg-[#eee5ff] text-[#7443b6]',
};

export default async function AuditorDashboard() {
  const user = await getCurrentUser();
  if (!user || !['AUDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) redirect('/login');

  const apps = await prisma.pengajuan.findMany({
    where: user.role === 'AUDITOR' ? { assignments: { some: { auditorId: user.id } } } : {},
    include: {
      assignments: { where: user.role === 'AUDITOR' ? { auditorId: user.id } : undefined, include: { auditor: { select: { name: true } } }, orderBy: { assignedAt: 'desc' } },
      _count: { select: { products: true, ingredients: true, temuan: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  const counts = {
    assigned: apps.length,
    pending: apps.filter(a => a.status === 'MENUNGGU_AUDITOR').length,
    auditing: apps.filter(a => a.status === 'SEDANG_DIAUDIT').length,
    fixes: apps.filter(a => ['PERLU_PERBAIKAN', 'MENUNGGU_VERIFIKASI'].includes(a.status)).length,
    done: apps.filter(a => a.status === 'SELESAI').length,
  };
  const cards = [[ClipboardCheck, 'Audit Ditugaskan', counts.assigned, 'bg-[#e4f1ff] text-[#337bc0]'], [Clock3, 'Menunggu Dimulai', counts.pending, 'bg-[#fff3d6] text-[#d49a1e]'], [ClipboardCheck, 'Sedang Audit', counts.auditing, 'bg-[#dff4ea] text-[#1e9a71]'], [FileWarning, 'Tindak Lanjut', counts.fixes, 'bg-[#ffe6e2] text-[#c54b39]'], [ShieldCheck, 'Audit Selesai', counts.done, 'bg-[#eee5ff] text-[#7443b6]']];

  return <div className="space-y-7">
    <div><p className="mb-2 text-xs font-bold text-[#08725b]">Ruang Kerja Auditor</p><h1 className="display-font text-3xl font-extrabold tracking-[-.05em] text-[#10211e]">Assignment Audit</h1><p className="mt-1 text-sm text-[#71847f]">Kelola pengajuan yang ditugaskan dan lanjutkan pemeriksaan dari satu tempat.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([Icon, label, value, tint]: any[]) => <div key={String(label)} className="rounded-2xl border border-[#e2eeeb] bg-white p-4"><div className="flex items-center justify-between"><div><p className="text-[11px] text-[#71847f]">{label}</p><p className="display-font mt-1 text-2xl font-extrabold text-[#183b34]">{value}</p></div><div className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}><Icon size={17}/></div></div></div>)}</div>
    <section className="overflow-hidden rounded-2xl border border-[#dce9e5] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf3f1] px-5 py-5"><div><h2 className="display-font font-bold text-[#183b34]">Assignment Saya</h2><p className="mt-1 text-xs text-[#8a9b97]">Prioritaskan audit yang menunggu dimulai atau verifikasi perbaikan.</p></div><div className="relative hidden sm:block"><Search className="absolute left-3 top-2.5 text-[#8a9b97]" size={15}/><input placeholder="Cari audit..." className="h-9 rounded-lg bg-[#f5f9f8] pl-9 text-xs outline-none"/></div></div>{apps.length === 0 ? <div className="p-12 text-center text-sm text-[#71847f]">Belum ada assignment audit.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-[#fbfdfc] text-[10px] font-bold text-[#8a9b97]"><tr><th className="px-5 py-3">Nomor Audit</th><th className="px-5 py-3">Perusahaan</th><th className="px-5 py-3">Ditugaskan</th><th className="px-5 py-3">Data</th><th className="px-5 py-3">Temuan</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Aksi</th></tr></thead><tbody>{apps.map(a => { const assignment = a.assignments[0]; const actionable = ['MENUNGGU_AUDITOR', 'SEDANG_DIAUDIT', 'MENUNGGU_VERIFIKASI', 'PERLU_PERBAIKAN'].includes(a.status); return <tr key={a.id} className="border-t border-[#edf3f1] text-[#526b66]"><td className="px-5 py-4 font-bold text-[#08725b]">{a.auditNumber}</td><td className="px-5 py-4"><div className="font-semibold text-[#234940]">{a.companyName}</div><div className="mt-1 text-[10px] text-[#8a9b97]">{a.type === 'SPPG' ? 'SPPG' : 'Pelaku Usaha'} · {a.factoryName}</div></td><td className="px-5 py-4"><div>{assignment ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(assignment.assignedAt) : '-'}</div><div className="mt-1 text-[10px] text-[#8a9b97]">{assignment?.auditor.name || 'Tim auditor'}</div></td><td className="px-5 py-4">{a._count.products} produk · {a._count.ingredients} bahan</td><td className="px-5 py-4">{a._count.temuan}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[a.status] || 'bg-[#f1f4f3] text-[#647873]'}`}>{statusLabel[a.status] || a.status.replaceAll('_', ' ')}</span></td><td className="px-5 py-4"><Link href={`/admin/pengajuan/${a.id}/audit`} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-bold ${actionable ? 'bg-[#e7f5ef] text-[#08725b]' : 'border border-[#dce9e5] text-[#647873]'}`}>{a.status === 'MENUNGGU_AUDITOR' ? 'Mulai Audit' : 'Buka Audit'} <ArrowRight size={12}/></Link></td></tr>; })}</tbody></table></div>}</section>
  </div>;
}
