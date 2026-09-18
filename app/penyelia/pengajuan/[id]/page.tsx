import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { SubmitApplicationButton } from '@/components/submit-application-button';
import { PengajuanStepper } from '@/components/pengajuan-stepper';

export default async function PengajuanDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pengajuan = await prisma.pengajuan.findUnique({
    where: { id },
    include: { products: true, ingredients: true },
  });

  if (!pengajuan) return <div className="p-4">Pengajuan tidak ditemukan</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PengajuanStepper applicationId={id} current={0} />
      <div>
        <p className="mb-2 text-xs font-bold text-[#08725b]">Langkah 01 dari 05</p>
        <h1 className="display-font text-3xl font-extrabold tracking-[-.05em] text-[#10211e]">Data Perusahaan</h1>
        <p className="mt-1 text-sm text-[#71847f]">Periksa informasi perusahaan sebelum melanjutkan ke produk.</p>
      </div>
      <div className="rounded-2xl border border-[#dce9e5] bg-white p-6">
        <h2 className="display-font text-xl font-bold text-[#183b34]">{pengajuan.companyName}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#f5faf8] p-4"><p className="text-xs text-[#71847f]">Status</p><p className="mt-1 text-sm font-bold text-[#234940]">{pengajuan.status}</p></div>
          <div className="rounded-xl bg-[#f5faf8] p-4"><p className="text-xs text-[#71847f]">Jenis Pengajuan</p><p className="mt-1 text-sm font-bold text-[#234940]">{pengajuan.type}</p></div>
          <div className="rounded-xl bg-[#f5faf8] p-4"><p className="text-xs text-[#71847f]">Pabrik / Unit Usaha</p><p className="mt-1 text-sm font-bold text-[#234940]">{pengajuan.factoryName}</p></div>
          <div className="rounded-xl bg-[#f5faf8] p-4"><p className="text-xs text-[#71847f]">Data Terkait</p><p className="mt-1 text-sm font-bold text-[#234940]">{pengajuan.products.length} produk · {pengajuan.ingredients.length} bahan</p></div>
        </div>
      </div>
      {pengajuan.status === 'DRAFT' && (
        <div className="rounded-2xl border-2 border-[#f0dfae] bg-[#fffaf0] p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-sm font-bold text-[#6b520d]">Pengajuan belum dikirim</h2><p className="mt-1 max-w-xl text-xs leading-5 text-[#806f42]">Lengkapi semua langkah terlebih dahulu. Tombol kirim tersedia di halaman Review.</p></div>
            <Link href={`/penyelia/pengajuan/${id}/review`} className="rounded-xl bg-[#08725b] px-4 py-3 text-xs font-bold text-white">Buka Review</Link>
          </div>
        </div>
      )}
      {pengajuan.status !== 'DRAFT' && pengajuan.status !== 'SELESAI' && <p className="text-xs text-[#71847f]">Laporan akhir tersedia setelah proses audit selesai dan status pengajuan menjadi Selesai.</p>}
      {pengajuan.status === 'SELESAI' && <a href={`/api/report/${id}`} className="inline-flex rounded-xl bg-[#075b49] px-4 py-3 text-xs font-bold text-white">Download Laporan Akhir</a>}
      <Link href={`/penyelia/pengajuan/${id}/temuan`} className="inline-flex rounded-xl border border-[#dce9e5] bg-white px-4 py-3 text-xs font-bold text-[#c54b39]">Temuan & Perbaikan</Link>
    </div>
  );
}
