'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Loader2, UserRound } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Application = { id: string; auditNumber: string; companyName: string; factoryName: string; ownerName: string; type: string; status: string; products: unknown[]; ingredients: unknown[]; temuan: unknown[]; assignments: { auditor: { id: string; name: string; email: string; role: string }; auditorName?: string | null; auditorTitle?: string | null; notes?: string | null }[] };
type Auditor = { id: string; name: string; email: string; role: string };

const statusLabel: Record<string, string> = { DRAFT: 'Draft', DIAJUKAN: 'Diajukan', MENUNGGU_REVIEW: 'Menunggu Review', MENUNGGU_AUDITOR: 'Menunggu Auditor', SEDANG_DIAUDIT: 'Sedang Diaudit', PERLU_PERBAIKAN: 'Perlu Perbaikan', MENUNGGU_VERIFIKASI: 'Menunggu Verifikasi', SELESAI: 'Selesai' };
const nextActions: Record<string, { status: string; label: string; description: string }[]> = {
  DIAJUKAN: [{ status: 'MENUNGGU_REVIEW', label: 'Mulai Review', description: 'Pengajuan masuk ke tahap review admin.' }],
  MENUNGGU_REVIEW: [],
};

export default function AdminPengajuanDetail() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [selectedAuditor, setSelectedAuditor] = useState('');
  const [auditorSearch, setAuditorSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const [appRes, auditorRes] = await Promise.all([fetch(`/api/pengajuan/${id}`), fetch(`/api/assignments?pengajuanId=${id}`)]);
    if (appRes.ok) setApp(await appRes.json());
    if (auditorRes.ok) { const data = await auditorRes.json(); setAuditors(data.auditors || data); }
  }
  useEffect(() => { load(); }, [id]);

  async function changeStatus(status: string, description: string) {
    setBusy(status); setMessage('');
    const res = await fetch(`/api/pengajuan/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, description }) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Status tidak dapat diperbarui.'); else await load();
    setBusy('');
  }

  async function assign() {
    if (!selectedAuditor) return;
    setBusy('assign'); setMessage('');
    const res = await fetch('/api/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pengajuanId: id, auditorId: selectedAuditor, notes }) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Assignment gagal disimpan.'); else { setMessage('Auditor berhasil ditugaskan.'); setSelectedAuditor(''); setNotes(''); await load(); }
    setBusy('');
  }

  if (!app) return <div className="rounded-2xl border border-[#dce9e5] bg-white p-12 text-center text-sm text-[#71847f]">Memuat pengajuan...</div>;
  const actions = nextActions[app.status] || [];
  const canAssign = ['MENUNGGU_REVIEW', 'MENUNGGU_AUDITOR'].includes(app.status);

  return <div className="mx-auto max-w-6xl space-y-6">
    <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-[#08725b]"><ArrowLeft size={14}/> Kembali ke dashboard</Link>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-xs font-bold text-[#08725b]">Administrasi Pengajuan · {app.auditNumber}</p><h1 className="display-font text-3xl font-extrabold tracking-[-.05em] text-[#10211e]">{app.companyName}</h1><p className="mt-1 text-sm text-[#71847f]">{app.factoryName} · {app.type === 'SPPG' ? 'SPPG' : 'Pelaku Usaha'}</p></div><span className="rounded-full bg-[#fff4d7] px-3 py-1.5 text-[10px] font-bold text-[#a66a00]">{statusLabel[app.status] || app.status}</span></div>
    {message && <div className="rounded-xl border border-[#bde4d2] bg-[#e8f7f0] px-4 py-3 text-xs font-semibold text-[#256f59]">{message}</div>}
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5"><section className="rounded-2xl border border-[#dce9e5] bg-white p-5 sm:p-7"><h2 className="display-font mb-5 text-lg font-bold text-[#183b34]">Ringkasan Pengajuan</h2><div className="grid gap-5 sm:grid-cols-2">{[['Penanggung jawab', app.ownerName], ['Status', statusLabel[app.status] || app.status], ['Produk', `${app.products.length} item`], ['Bahan', `${app.ingredients.length} item`], ['Temuan', `${app.temuan.length} temuan`], ['Auditor', app.assignments.length ? app.assignments.map(a => a.auditorName || a.auditor.name).join(', ') : 'Belum ditetapkan']].map(([label, value]) => <div key={String(label)}><p className="text-[10px] font-bold text-[#8a9b97]">{label}</p><p className="mt-1 text-sm text-[#234940]">{value}</p></div>)}</div></section><div className="flex flex-wrap gap-3"><Link href={`/admin/pengajuan/${id}/audit`} className="inline-flex items-center gap-2 rounded-xl bg-[#08725b] px-4 py-3 text-xs font-bold text-white"><ClipboardCheck size={15}/> Buka Ruang Audit <ArrowRight size={14}/></Link>{app.status === 'SELESAI' && <a href={`/api/report/${id}`} className="rounded-xl border border-[#dce9e5] bg-white px-4 py-3 text-xs font-bold text-[#234940]">Download Laporan</a>}</div></div>
      <div className="space-y-5"><section className="rounded-2xl border border-[#dce9e5] bg-white p-5"><h2 className="display-font mb-4 text-lg font-bold text-[#183b34]">Tindakan Admin</h2>{actions.length ? actions.map(action => <button key={action.status} onClick={() => changeStatus(action.status, action.description)} disabled={!!busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#08725b] px-4 py-3 text-xs font-bold text-white">{busy === action.status && <Loader2 className="animate-spin" size={14}/>} {action.label}</button>) : <p className="text-xs leading-5 text-[#71847f]">Tahap pengajuan saat ini tidak membutuhkan transisi admin langsung.</p>}</section><section className={`rounded-2xl border border-[#dce9e5] bg-white p-5 ${canAssign ? '' : 'opacity-70'}`}><div className="mb-4 flex items-center gap-2"><UserRound size={17} className="text-[#08725b]"/><h2 className="display-font text-lg font-bold text-[#183b34]">Tetapkan Auditor</h2></div><input value={auditorSearch} onChange={e => setAuditorSearch(e.target.value)} disabled={!canAssign || !!busy} placeholder="Ketik nama auditor" className="h-10 w-full rounded-xl border border-[#dce9e5] bg-white px-3 text-xs outline-none focus:border-[#0a8065]"/><div className="mt-2 max-h-44 space-y-1 overflow-y-auto">{auditors.filter(a => !auditorSearch.trim() || a.name.toLowerCase().includes(auditorSearch.toLowerCase())).map(a => <button type="button" key={a.id} onClick={() => { setSelectedAuditor(a.id); setAuditorSearch(a.name); }} disabled={!canAssign || !!busy} className={`block w-full rounded-lg px-3 py-2 text-left text-xs ${selectedAuditor === a.id ? 'bg-[#e7f5ef] font-bold text-[#08725b]' : 'text-[#526b66] hover:bg-[#f5faf8]'}`}>{a.name} · {a.role}</button>)}{auditors.filter(a => !auditorSearch.trim() || a.name.toLowerCase().includes(auditorSearch.toLowerCase())).length === 0 && <p className="px-3 py-2 text-xs text-[#8a9b97]">Auditor tidak ditemukan.</p>}</div><textarea value={notes} onChange={e => setNotes(e.target.value)} disabled={!canAssign || !!busy} placeholder="Catatan assignment (opsional)" rows={3} className="mt-3 w-full rounded-xl border border-[#dce9e5] px-3 py-2 text-xs outline-none focus:border-[#0a8065]"/><button onClick={assign} disabled={!canAssign || !selectedAuditor || !!busy} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a8065] px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{busy === 'assign' && <Loader2 className="animate-spin" size={14}/>}<Check size={14}/> Simpan Assignment</button>{app.assignments.length > 0 && <div className="mt-4 space-y-2 border-t border-[#edf3f1] pt-4">{app.assignments.map(a => <div key={a.auditor.id} className="rounded-lg bg-[#f5f9f8] p-3"><p className="text-xs font-bold text-[#234940]">{a.auditorName || a.auditor.name}</p><p className="mt-1 text-[10px] text-[#71847f]">{a.auditor.email}</p><p className="mt-1 text-[10px] font-semibold text-[#08725b]">{a.auditorName ? `${a.auditorName}${a.auditorTitle ? `, ${a.auditorTitle}` : ''}` : 'Identitas auditor belum diisi'}</p></div>)}</div>}</section></div>
    </div>
  </div>;
}
