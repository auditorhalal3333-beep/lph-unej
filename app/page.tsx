import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileCheck2, HeartHandshake, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { MarketingNav } from '@/components/marketing-nav';

const benefits = [
  { icon: FileCheck2, title: 'Proses Terstruktur', text: 'Alur jelas dan mudah diikuti' },
  { icon: ShieldCheck, title: 'Data Aman', text: 'Sistem terintegrasi dan terpercaya' },
  { icon: UsersRound, title: 'Didampingi Tim Ahli', text: 'Bersama auditor berpengalaman' },
];

export default function Home() {
  return (
    <main id="beranda" className="min-h-screen overflow-hidden bg-[#f7fbfa]">
      <MarketingNav />
      <section className="relative mx-auto grid min-h-[700px] max-w-[1480px] items-center overflow-hidden px-6 pb-16 pt-36 sm:px-10 lg:grid-cols-[.92fr_1.08fr] lg:px-16 lg:pb-24 lg:pt-40">
        <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-[#d9f2e9]/60 blur-3xl" />
        <div className="animate-rise relative z-10 max-w-xl">
          <div className="mb-5 flex items-center gap-2 text-[11px] font-bold tracking-[.18em] text-[#08725b]"><Sparkles size={15} /> HALAL UNTUK KEBAIKAN BERSAMA</div>
          <h1 className="display-font max-w-lg text-5xl font-extrabold leading-[1.04] tracking-[-.055em] text-[#073f34] sm:text-6xl">Sistem Audit<br />Sertifikasi Halal</h1>
          <p className="mt-5 max-w-md text-[23px] font-medium leading-[1.15] text-[#1b5a4c]">Lembaga Pemeriksa Halal<br />Universitas Jember</p>
          <p className="mt-5 max-w-md text-[14px] leading-6 text-[#526b66]">Mendukung terwujudnya produk halal yang aman, berkualitas, dan terpercaya melalui proses audit yang profesional, transparan, dan terintegrasi.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="group flex items-center gap-3 rounded-xl bg-[#08725b] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(8,114,91,.22)] transition hover:bg-[#063f34]">Ajukan Sertifikasi <ArrowRight size={17} className="transition group-hover:translate-x-1" /></Link>
            <a href="#alur" className="rounded-xl border border-[#70a99b] bg-white/60 px-5 py-3.5 text-sm font-bold text-[#075b49] transition hover:bg-white">Pelajari Lebih Lanjut</a>
          </div>
        </div>
        <div className="relative mt-12 min-h-[390px] lg:mt-0 lg:min-h-[480px]">
          <div className="absolute right-[-20%] top-[-7%] h-[115%] w-[115%] rounded-[48%] bg-[#d8eee5] opacity-80" />
          <div className="absolute right-[2%] top-[3%] h-[91%] w-[91%] rounded-[45%] bg-gradient-to-br from-[#c3dfd4] via-[#eff8f4] to-[#b2d1c3]" />
          <div className="absolute right-[7%] top-[8%] h-[82%] w-[82%] overflow-hidden rounded-[42%] bg-[#d1e6da] shadow-inner">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,.6),transparent_40%),linear-gradient(0deg,rgba(7,91,73,.14),transparent_55%)]" />
            <div className="absolute bottom-[18%] left-[15%] h-[43%] w-[70%] skew-x-[-8deg] rounded-t-[12%] bg-[#f7faf7] shadow-[0_18px_30px_rgba(8,68,56,.12)]"><div className="absolute inset-x-[8%] top-[10%] h-[7%] bg-[#a6c2b5]" /><div className="absolute inset-x-[12%] top-[26%] h-[35%] bg-[#dceae4]" /></div>
            <div className="absolute bottom-[12%] left-[4%] h-[30%] w-[35%] rounded-t-full bg-[#79a789] opacity-60" /><div className="absolute bottom-[13%] right-[1%] h-[28%] w-[34%] rounded-t-full bg-[#6f9d81] opacity-60" />
            <div className="absolute bottom-[19%] left-[29%] z-10 bg-[#d0b94e] px-3 py-1 text-[11px] font-extrabold tracking-wider text-[#144e3c] shadow-sm">UNIVERSITAS JEMBER</div>
          </div>
          <div className="absolute bottom-0 right-0 h-52 w-32 rounded-tl-[100%] rounded-br-[40%] bg-[#8fc6a2]/70" /><div className="absolute bottom-2 right-14 h-28 w-16 rounded-tl-[100%] bg-[#3b9877]/60" />
          <div className="absolute bottom-[6%] left-[6%] max-w-[180px] italic leading-6 text-[#236352]"><div className="mb-2 h-0.5 w-8 bg-[#0a8065]" />“Halal Hari Ini,<br /><span className="font-semibold">Berkah untuk Esok”</span></div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1180px] gap-4 px-6 pb-20 sm:grid-cols-3 sm:px-10">
        {benefits.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-[#e1eeea] bg-white p-5 shadow-[0_8px_22px_rgba(7,91,73,.04)]"><div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#e2f5ed] text-[#08725b]"><Icon size={21} /></div><h3 className="display-font text-sm font-bold text-[#183b34]">{title}</h3><p className="mt-1 text-xs leading-5 text-[#687c77]">{text}</p></div>)}
      </section>
      <section id="alur" className="border-t border-[#e1eeea] bg-white px-6 py-20 text-center"><p className="text-xs font-bold tracking-[.18em] text-[#08725b]">ALUR SERTIFIKASI</p><h2 className="display-font mt-3 text-3xl font-extrabold tracking-[-.04em] text-[#073f34]">Dari pengajuan hingga laporan akhir</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#687c77]">Isi data secara bertahap, lengkapi bukti, dan pantau proses audit halal Anda dalam satu sistem yang terintegrasi.</p><div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3 text-sm font-semibold text-[#216655]"><span className="rounded-full bg-[#e7f5ef] px-4 py-2">1. Pengajuan</span><span className="rounded-full bg-[#e7f5ef] px-4 py-2">2. Pemeriksaan</span><span className="rounded-full bg-[#e7f5ef] px-4 py-2">3. Perbaikan</span><span className="rounded-full bg-[#e7f5ef] px-4 py-2">4. Laporan</span></div></section>
      <footer id="bantuan" className="bg-[#063f34] px-6 py-10 text-center text-white"><div className="flex justify-center"><div className="flex items-center gap-2 text-sm font-bold"><HeartHandshake size={18} /> LPH UNEJ</div></div><p className="mt-3 text-xs text-white/65">Lembaga Pemeriksa Halal · Universitas Jember</p></footer>
    </main>
  );
}
