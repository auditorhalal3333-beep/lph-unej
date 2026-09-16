'use client';
import { Bell, Menu, Search, ChevronDown, CheckCheck } from 'lucide-react';
import { BrandMark } from './brand-mark';
import { useEffect, useRef, useState } from 'react';

type Notice = { id: string; title: string; message: string; readAt: string | null; createdAt: string; pengajuanId?: string | null };
type Identity = { name?: string | null; email?: string | null; role?: string | null };
const roleLabel: Record<string, string> = { PENYELIA: 'Penyelia', AUDITOR: 'Auditor', ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin' };

export function AppTopbar({ onMenu }: { onMenu?: () => void }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [identity, setIdentity] = useState<Identity>({});
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mounted = true;
    Promise.all([fetch('/api/notifications'), fetch('/api/auth/session')]).then(async ([notes, session]) => {
      if (!mounted) return;
      if (notes.ok) setNotices(await notes.json());
      if (session.ok) { const data = await session.json(); if (data.user) setIdentity(data.user); }
    });
    return () => { mounted = false; };
  }, []);
  useEffect(() => { const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  const unread = notices.filter(n => !n.readAt).length;
  const initials = (identity.name || identity.email || 'LPH').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  async function markRead(id: string) { await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); setNotices(current => current.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)); }
  async function markAllRead() { await Promise.all(notices.filter(n => !n.readAt).map(n => markRead(n.id))); }
  return <header className="flex h-[76px] items-center justify-between border-b border-[#e3eeeb] bg-white px-5 sm:px-8"><div className="flex items-center gap-4"><button className="text-[#075b49] lg:hidden" onClick={onMenu} aria-label="Buka menu"><Menu size={22} /></button><div className="hidden scale-[.72] origin-left sm:block lg:hidden"><BrandMark /></div><div className="relative hidden xl:block"><Search className="absolute left-3 top-2.5 text-[#8ca09b]" size={16} /><input placeholder="Cari pengajuan..." className="h-9 w-64 rounded-lg bg-[#f5f9f8] pl-9 text-xs outline-none placeholder:text-[#9aaba7]" /></div></div><div className="flex items-center gap-5"><div ref={ref} className="relative"><button className="relative text-[#55716a]" aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ''}`} aria-expanded={open} onClick={() => setOpen(value => !value)}><Bell size={19} />{unread > 0 && <span className="absolute -right-2 -top-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#e3a824] px-1 text-[9px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}</button>{open && <div className="absolute right-0 top-10 z-30 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#dce9e5] bg-white shadow-[0_16px_40px_rgba(7,91,73,.14)]"><div className="flex items-center justify-between border-b border-[#edf3f1] px-4 py-3"><div><p className="text-xs font-bold text-[#183b34]">Notifikasi</p><p className="mt-0.5 text-[10px] text-[#8a9b97]">Pembaruan assignment dan status audit</p></div>{unread > 0 && <button onClick={markAllRead} className="inline-flex items-center gap-1 text-[10px] font-bold text-[#08725b]"><CheckCheck size={13}/> Tandai dibaca</button>}</div><div className="max-h-80 overflow-y-auto">{notices.length === 0 ? <p className="px-4 py-8 text-center text-xs text-[#71847f]">Belum ada notifikasi.</p> : notices.map(notice => <button key={notice.id} onClick={() => markRead(notice.id)} className={`block w-full border-b border-[#edf3f1] px-4 py-3 text-left last:border-0 ${notice.readAt ? 'bg-white' : 'bg-[#f5fcf8]'}`}><div className="flex gap-2"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notice.readAt ? 'bg-[#dce9e5]' : 'bg-[#e3a824]'}`}/><div className="min-w-0"><p className="text-xs font-bold text-[#234940]">{notice.title}</p><p className="mt-1 text-[11px] leading-4 text-[#647873]">{notice.message}</p><p className="mt-1 text-[10px] text-[#9aaba7]">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notice.createdAt))}</p></div></div></button>)}</div></div>}</div><div className="h-7 w-px bg-[#e5efec]" /><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#e7f1ee] text-xs font-bold text-[#075b49]">{initials}</div><div className="hidden leading-tight sm:block"><div className="text-xs font-bold text-[#183b34]">{identity.name || 'Pengguna LPH'}</div><div className="mt-0.5 text-[10px] text-[#83928e]">{roleLabel[identity.role || ''] || 'Pengguna'}</div></div><ChevronDown size={15} className="text-[#78908a]" /></div></div></header>;
}
