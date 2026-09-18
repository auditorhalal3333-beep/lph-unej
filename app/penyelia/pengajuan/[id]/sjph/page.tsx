'use client';

import { useEffect, useState } from 'react';
import { Check, CircleAlert, FileText, Save } from 'lucide-react';
import { useParams } from 'next/navigation';
import { PengajuanStepper } from '@/components/pengajuan-stepper';

type Category = { id: string; code: string; name: string; criteria: { id: string; code: string; title: string; evidenceHint?: string | null; required: boolean }[] };
type Response = { criterionId: string; providerStatus: string; providerNotes: string | null };

export default function SJPHPage() {
  const params = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/sjph/criteria?pengajuanId=${params.id}`).then(r => r.json()),
      fetch(`/api/sjph?pengajuanId=${params.id}`).then(r => r.json()),
    ]).then(([cats, saved]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      const map: Record<string, Response> = {};
      (Array.isArray(saved) ? saved : []).forEach((item: Response) => { map[item.criterionId] = item; });
      setResponses(map);
      setLoaded(true);
    });
  }, [params.id]);

  function update(id: string, key: keyof Response, value: string) {
    setSaveMessage('');
    setResponses(prev => ({ ...prev, [id]: { criterionId: id, providerStatus: prev[id]?.providerStatus ?? 'BELUM_DIISI', providerNotes: prev[id]?.providerNotes ?? null, [key]: value } }));
  }

  async function saveAll() {
    if (saving) return;
    setSaving(true);
    setSaveMessage('');
    const payload = Object.values(responses).map(({ criterionId, providerStatus, providerNotes }) => ({ criterionId, providerStatus, providerNotes }));
    const result = await fetch('/api/sjph', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pengajuanId: params.id, responses: payload }) });
    setSaving(false);
    setSaveMessage(result.ok ? 'Semua jawaban berhasil disimpan.' : 'Jawaban belum dapat disimpan. Coba lagi.');
  }

  const category = categories[active];
  const completed = category?.criteria.filter(c => responses[c.id]?.providerStatus === 'SUDAH_DIISI').length ?? 0;
  return <div className="space-y-7"><PengajuanStepper applicationId={params.id} current={3} /><div><p className="mb-2 text-xs font-bold text-[#08725b]">Langkah 04 dari 05</p><h1 className="display-font text-3xl font-extrabold tracking-[-.05em] text-[#10211e]">Implementasi SJPH</h1><p className="mt-1 text-sm text-[#71847f]">Lengkapi bukti dan keterangan untuk setiap kriteria, lalu simpan seluruh jawaban sekaligus.</p></div><div className="grid gap-5 lg:grid-cols-[245px_1fr]"><aside className="rounded-2xl border border-[#dce9e5] bg-white p-3"><div className="mb-3 px-3 py-2 text-[10px] font-bold tracking-[.12em] text-[#8a9b97]">KELOMPOK SJPH</div>{categories.map((item, i) => <button key={item.id} onClick={() => setActive(i)} className={`mb-1 w-full rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${i === active ? 'bg-[#e7f5ef] text-[#08725b]' : 'text-[#647873] hover:bg-[#f4f9f7]'}`}><span className="flex items-center justify-between gap-2"><span>{i + 1}. {item.name}</span>{i === active && <span className="text-[10px]">{completed}/{item.criteria.length}</span>}</span></button>)}</aside><section className="rounded-2xl border border-[#dce9e5] bg-white p-5 sm:p-7">{!loaded ? <div className="py-16 text-center text-sm text-[#71847f]">Memuat kriteria SJPH...</div> : category ? <><div className="mb-6 flex items-start justify-between gap-4 border-b border-[#edf3f1] pb-5"><div><h2 className="display-font text-xl font-bold text-[#183b34]">{category.name}</h2><p className="mt-1 text-xs text-[#71847f]">{category.criteria.length} kriteria perlu dilengkapi</p></div><span className="rounded-full bg-[#e7f5ef] px-3 py-1.5 text-[10px] font-bold text-[#08725b]">{completed}/{category.criteria.length} selesai</span></div><div className="space-y-4">{category.criteria.map((criterion, i) => { const response = responses[criterion.id]; const done = response?.providerStatus === 'SUDAH_DIISI'; return <div key={criterion.id} className="rounded-2xl border border-[#e2eeeb] bg-[#fbfdfc] p-4 sm:p-5"><div className="flex items-start gap-3"><div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? 'bg-[#dff4ea] text-[#08725b]' : 'bg-[#edf2f1] text-[#71847f]'}`}>{done ? <Check size={14}/> : i + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-[#234940]">{criterion.title}</h3>{criterion.required && <span className="text-[10px] font-semibold text-[#c8784a]">Wajib</span>}</div><p className="mt-1 text-[11px] text-[#83928e]">{criterion.evidenceHint}</p><div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]"><select value={response?.providerStatus ?? 'BELUM_DIISI'} onChange={e => update(criterion.id, 'providerStatus', e.target.value)} className="h-10 rounded-xl border border-[#dce9e5] bg-white px-3 text-xs text-[#526b66] outline-none focus:border-[#0a8065]"><option value="BELUM_DIISI">Belum diisi</option><option value="SUDAH_DIISI">Sudah tersedia</option><option value="TIDAK_BERLAKU">Tidak berlaku</option></select><input type="url" value={response?.providerNotes ?? ''} onChange={e => update(criterion.id, 'providerNotes', e.target.value)} placeholder="https://drive.google.com/..." className="h-10 rounded-xl border border-[#dce9e5] bg-white px-3 text-xs outline-none focus:border-[#0a8065]" /></div><div className="mt-3 flex items-center gap-2 text-[10px] text-[#8a9b97]"><FileText size={14} className="text-[#08725b]"/> Bukti dapat berupa PDF, gambar, video, atau tautan Drive</div></div></div></div>; })}</div><div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf3f1] pt-5"><div className="flex items-center gap-3">{saveMessage && <span className={`text-xs font-semibold ${saveMessage.startsWith('Semua') ? 'text-[#08725b]' : 'text-[#c54b39]'}`}>{saveMessage}</span>}<button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#08725b] px-5 py-3 text-xs font-bold text-white disabled:opacity-60">{saving ? 'Menyimpan...' : <><Save size={14}/> Simpan Semua Jawaban</>}</button></div><div className="flex gap-2"><button disabled={active === 0} onClick={() => setActive(active - 1)} className="rounded-xl border border-[#dce9e5] px-4 py-2.5 text-xs font-bold text-[#526b66] disabled:opacity-40">Sebelumnya</button><button disabled={active === categories.length - 1} onClick={() => setActive(active + 1)} className="rounded-xl bg-[#08725b] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">Kelompok Berikutnya</button></div></div></> : <div className="py-16 text-center"><CircleAlert className="mx-auto text-[#d49a1e]"/><p className="mt-3 text-sm font-bold text-[#234940]">Kriteria belum tersedia</p><p className="mt-1 text-xs text-[#71847f]">Hubungi administrator LPH UNEJ.</p></div>}</section></div></div>;
}
