'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, ExternalLink, FileArchive, FileText, Loader2, Send, ShieldCheck } from 'lucide-react';
import { useParams } from 'next/navigation';

type Finding = { id: string; number: number; section: string; criterion?: string; description: string; instruction?: string; status: string; response?: string | null; fixes: { id: string; evidenceUrl: string; notes?: string | null; status: string; createdAt: string }[]; verifications: { result: string; note?: string | null; createdAt: string }[] };
const statusStyle: Record<string, string> = { OPEN: 'bg-[#ffe6e2] text-[#c54b39]', REJECTED: 'bg-[#ffe6e2] text-[#c54b39]', SUBMITTED: 'bg-[#fff4d7] text-[#a66a00]', VERIFIED: 'bg-[#e7f5ef] text-[#08725b]', CLOSED: 'bg-[#e7f5ef] text-[#08725b]' };
const statusLabel: Record<string, string> = { OPEN: 'Perlu Perbaikan', REJECTED: 'Perlu Perbaikan Ulang', SUBMITTED: 'Menunggu Verifikasi', VERIFIED: 'Diterima', CLOSED: 'Selesai' };

export default function FindingsPage() {
  const { id } = useParams<{ id: string }>();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [form, setForm] = useState({ evidenceUrl: '', notes: '' });
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  async function load() { setLoading(true); const res = await fetch(`/api/temuan?pengajuanId=${id}`); if (res.ok) setFindings(await res.json()); setLoading(false); }
  useEffect(() => { load(); }, [id]);
  async function submit(event: React.FormEvent) { event.preventDefault(); if (!active) return; setBusy(active); setMessage(''); const res = await fetch(`/api/temuan/${active}/fix`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const data = await res.json(); if (!res.ok) setMessage(data.error || 'Perbaikan gagal dikirim.'); else { setMessage('Perbaikan berhasil dikirim dan menunggu verifikasi auditor.'); setForm({ evidenceUrl: '', notes: '' }); setActive(null); await load(); } setBusy(''); }
  const open = findings.filter(f => !['VERIFIED', 'CLOSED'].includes(f.status)).length;

  return <div className="mx-auto max-w-5xl space-y-7">
    <div><p className="mb-2 text-xs font-bold text-[#08725b]">Tindak Lanjut Audit</p><h1 className="display-font text-3xl font-extrabold tracking-[-.05em] text-[#10211e]">Temuan & Perbaikan</h1><p className="mt-1 text-sm text-[#71847f]">Tinjau catatan auditor dan kirim bukti perbaikan untuk setiap temuan.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Perbaikan diperlukan" value={open} color="text-[#c54b39]"/><Stat label="Dikirim" value={findings.filter(f => f.status === 'SUBMITTED').length} color="text-[#a66a00]"/><Stat label="Diterima" value={findings.filter(f => ['VERIFIED', 'CLOSED'].includes(f.status)).length} color="text-[#08725b]"/></div>
    {message && <div className="rounded-xl border border-[#bde4d2] bg-[#e8f7f0] px-4 py-3 text-sm text-[#256f59]">{message}</div>}
    {loading ? <div className="rounded-2xl border border-[#dce9e5] bg-white p-12 text-center text-sm text-[#71847f]">Memuat temuan...</div> : findings.length === 0 ? <div className="rounded-2xl border border-dashed border-[#cfe2dc] bg-white p-14 text-center"><Check className="mx-auto text-[#08725b]" size={30}/><h2 className="mt-3 font-bold text-[#234940]">Tidak ada temuan</h2><p className="mt-1 text-xs text-[#71847f]">Belum ada permintaan perbaikan dari auditor.</p></div> : <div className="space-y-4">{findings.map(f => <FindingCard key={f.id} finding={f} active={active} setActive={setActive} form={form} setForm={setForm} busy={busy} submit={submit}/>)}</div>}
  </div>;
}
function Stat({ label, value, color }: { label: string; value: number; color: string }) { return <div className="rounded-2xl border border-[#dce9e5] bg-white p-5"><p className="text-xs text-[#71847f]">{label}</p><p className={`display-font mt-2 text-3xl font-extrabold ${color}`}>{value}</p></div>; }
function FindingCard({ finding: f, active, setActive, form, setForm, busy, submit }: { finding: Finding; active: string | null; setActive: (id: string | null) => void; form: { evidenceUrl: string; notes: string }; setForm: (form: { evidenceUrl: string; notes: string }) => void; busy: string; submit: (event: React.FormEvent) => void }) {
  const canFix = ['OPEN', 'REJECTED'].includes(f.status);
  return <article className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_6px_20px_rgba(7,91,73,.035)] sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff0ec] text-xs font-bold text-[#c54b39]">#{String(f.number).padStart(2, '0')}</div><div><p className="text-[10px] font-bold text-[#c54b39]">{f.section}{f.criterion && ` · ${f.criterion}`}</p><h2 className="mt-1 text-sm font-bold text-[#234940]">{f.description}</h2></div></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${statusStyle[f.status] || statusStyle.OPEN}`}>{statusLabel[f.status] || f.status}</span></div>
    {f.instruction && <div className="mt-4 rounded-xl bg-[#fffaf8] p-4"><p className="text-[10px] font-bold text-[#8a9b97]">INSTRUKSI AUDITOR</p><p className="mt-1 text-xs leading-5 text-[#526b66]">{f.instruction}</p></div>}
    {f.fixes.length > 0 && <div className="mt-4 space-y-2">{f.fixes.map(fix => <a key={fix.id} href={fix.evidenceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-[#dce9e5] bg-[#fbfdfc] p-3"><FileArchive size={17} className="text-[#08725b]"/><span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#234940]">Bukti perbaikan · {fix.notes || 'Buka tautan'}</span><ExternalLink size={14} className="text-[#8a9b97]"/></a>)}</div>}
    {f.verifications.length > 0 && <div className="mt-3 text-[10px] text-[#71847f]">Catatan verifikasi terakhir: {f.verifications[f.verifications.length - 1].note || 'Tidak ada catatan tambahan.'}</div>}
    {canFix && (active === f.id ? <form onSubmit={submit} className="mt-5 rounded-xl border border-[#bde4d2] bg-[#f5fcf8] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#08725b]"><ShieldCheck size={15}/> Kirim Perbaikan</div><input value={form.evidenceUrl} onChange={e => setForm({ ...form, evidenceUrl: e.target.value })} placeholder="Tautan Google Drive bukti perbaikan" type="url" required className="h-10 w-full rounded-xl border border-[#cfe2dc] bg-white px-3 text-xs outline-none focus:border-[#0a8065]"/><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Keterangan perbaikan" rows={3} className="mt-3 w-full rounded-xl border border-[#cfe2dc] bg-white px-3 py-2 text-xs outline-none focus:border-[#0a8065]"/><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setActive(null)} className="rounded-lg border border-[#dce9e5] px-3 py-2 text-[10px] font-bold text-[#647873]">Batal</button><button disabled={busy === f.id} className="inline-flex items-center gap-1.5 rounded-lg bg-[#08725b] px-3 py-2 text-[10px] font-bold text-white">{busy === f.id ? <Loader2 className="animate-spin" size={13}/> : <Send size={13}/>} Kirim Perbaikan</button></div></form> : <button onClick={() => setActive(f.id)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#08725b] px-4 py-2.5 text-xs font-bold text-white"><FileText size={15}/> Tambahkan Bukti Perbaikan <ArrowRight size={14}/></button>)}
  </article>;
}
