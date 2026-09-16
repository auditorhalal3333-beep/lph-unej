'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Building2, ClipboardCheck, FileArchive, FileText, HelpCircle, LayoutDashboard, LogOut, Package, Settings2, ShieldCheck, UsersRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const baseMenu = [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { href: '/penyelia/dashboard', label: 'Pengajuan Saya', icon: FileText }];
export function AppSidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const path = usePathname();
  const match = path.match(/^\/penyelia\/pengajuan\/([^/]+)/);
  const applicationId = match?.[1];
  const menu = applicationId ? [
    ...baseMenu,
    { href: `/penyelia/pengajuan/${applicationId}`, label: 'Data Perusahaan', icon: Building2 },
    { href: `/penyelia/pengajuan/${applicationId}/produk`, label: 'Daftar Produk', icon: Package },
    { href: `/penyelia/pengajuan/${applicationId}/bahan`, label: 'Daftar Bahan', icon: ShieldCheck },
    { href: `/penyelia/pengajuan/${applicationId}/sjph`, label: 'Implementasi SJPH', icon: ClipboardCheck },
  ] : baseMenu;
  return <><div className={cn('fixed inset-0 z-30 bg-[#063f34]/30 transition lg:hidden', open ? 'visible opacity-100' : 'invisible opacity-0')} onClick={onClose} /><aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[255px] flex-col bg-[#075b49] text-white transition-transform duration-300 lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}><div className="flex items-center justify-between px-6 py-6"><Link href="/"><div className="scale-[.86] origin-left"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2c84b] text-[#075b49]"><ShieldCheck size={23} /></div><div><div className="display-font text-base font-extrabold">LPH UNEJ</div><div className="text-[9px] text-white/75">Lembaga Pemeriksa Halal</div><div className="text-[9px] text-white/75">Universitas Jember</div></div></div></div></Link><button className="lg:hidden" onClick={onClose}><X size={19} /></button></div><div className="mx-6 mb-5 h-px bg-white/20" /><nav className="flex-1 space-y-1 px-3">{menu.map(({ href, label, icon: Icon }) => <Link onClick={onClose} key={label} href={href} className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white', path === href && 'bg-[#e2f5ed] font-bold text-[#075b49] shadow-sm hover:bg-[#e2f5ed] hover:text-[#075b49]')}><Icon size={17} strokeWidth={1.8} />{label}</Link>)}<div className="mt-7 px-4 pb-2 text-[9px] font-bold tracking-[.14em] text-white/45">BANTUAN</div><Link href="/panduan" onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium text-white/75 hover:bg-white/10"><HelpCircle size={17} />Panduan Pengisian</Link><Link href="/kontak" onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium text-white/75 hover:bg-white/10"><UsersRound size={17} />Kontak LPH</Link></nav><div className="relative mt-auto overflow-hidden px-7 pb-9 pt-6"><div className="absolute -bottom-16 -left-8 h-40 w-40 rotate-45 rounded-[30%] border-[15px] border-white/10" /><div className="relative text-center text-xs italic text-white/70">“Dari Kehalalan<br />Menuju Kebermanfaatan”</div></div></aside></> }
