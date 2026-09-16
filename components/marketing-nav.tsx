import Link from 'next/link';
import { BrandMark } from './brand-mark';

export function MarketingNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 mx-auto max-w-[1480px] px-5 pt-4 sm:px-8 lg:px-12">
      <nav className="flex items-center justify-between rounded-b-[24px] bg-white/95 px-5 py-3 shadow-[0_12px_30px_rgba(7,91,73,.08)] backdrop-blur sm:px-7">
        <Link href="/"><BrandMark /></Link>
        <div className="hidden items-center gap-8 text-[13px] font-semibold text-[#425954] lg:flex">
          <a href="#beranda" className="text-[#075b49]">Beranda</a>
          <a href="#tentang">Tentang</a>
          <a href="#alur">Alur Sertifikasi</a>
          <a href="#bantuan">Bantuan</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-xl border border-[#0a8065] px-5 py-2.5 text-xs font-bold text-[#075b49] transition hover:bg-[#e9f7f2]">Masuk</Link>
          <Link href="/register" className="rounded-xl bg-[#075b49] px-5 py-2.5 text-xs font-bold text-white shadow-[0_7px_16px_rgba(7,91,73,.2)] transition hover:bg-[#063f34]">Daftar</Link>
        </div>
      </nav>
    </header>
  );
}
