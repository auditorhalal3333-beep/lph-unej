import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PengajuanStepper } from '@/components/pengajuan-stepper';
import { SubmitApplicationButton } from '@/components/submit-application-button';

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const application = await prisma.pengajuan.findFirst({
    where: { id, userId: user.id },
    include: { products: true, ingredients: true, sjphResponses: true },
  });
  if (!application) return <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#71847f]">Pengajuan tidak ditemukan.</div>;

  return <div className="mx-auto max-w-5xl space-y-7">
    <PengajuanStepper applicationId={id} current={4} />
    <div><p className="mb-2 text-xs font-bold text-[#08725b]">Langkah 05 dari 05</p><h1 className="display-font text-3xl font-extrabold tracking-[-.05em] text-[#10211e]">Review Pengajuan</h1><p className="mt-1 text-sm text-[#71847f]">Periksa kembali data sebelum mengirim pengajuan kepada admin.</p></div>
    <section className="rounded-2xl border border-[#dce9e5] bg-white p-6"><h2 className="display-font text-xl font-bold text-[#183b34]">Ringkasan Pengajuan</h2><div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-[#f5faf8] p-4"><p className="text-xs text-[#71847f]">Perusahaan</p><p className="mt-1 text-sm font-bold text-[#234940]">{application.companyName}</p></div><div className="rounded-xl bg-[#f5faf8] p-4"><p className="text-xs text-[#71847f]">Produk</p><p className="mt-1 text-sm font-bold text-[#234940]">{application.products.length} item</p></div><div className="rounded-xl bg-[#f5faf8] p-4"><p className="text-xs text-[#71847f]">Bahan</p><p className="mt-1 text-sm font-bold text-[#234940]">{application.ingredients.length} item</p></div></div><p className="mt-5 text-xs text-[#71847f]">Respons SJPH tersimpan: {application.sjphResponses.length} kriteria.</p></section>
    {application.status === 'DRAFT' && <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-[#f0dfae] bg-[#fffaf0] p-5"><div><h2 className="text-sm font-bold text-[#6b520d]">Data sudah siap dikirim?</h2><p className="mt-1 text-xs text-[#806f42]">Setelah dikirim, admin akan memulai proses review.</p></div><SubmitApplicationButton applicationId={id}/></section>}
  </div>;
}
