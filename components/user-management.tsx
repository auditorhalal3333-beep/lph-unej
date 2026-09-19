'use client';

import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, UserRound } from 'lucide-react';

type User = { id: string; name: string; email: string; role: string; company: string | null; createdAt: string };
type Auditor = { id: string; name: string; email: string; role: string; title?: string | null; active: boolean };
type Chair = { id: string; name: string; title?: string | null; active: boolean };

type Props = { users: User[] };

export function UserManagement({ users }: Props) {
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [kind, setKind] = useState<'AUDITOR' | 'CHAIR'>('AUDITOR');
  const [form, setForm] = useState({ name: '', title: '', email: '', password: '' });
  const [editing, setEditing] = useState<{ id: string; kind: 'AUDITOR' | 'CHAIR' } | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadStaff() {
    const res = await fetch('/api/admin/staff');
    if (res.ok) { const data = await res.json(); setAuditors(data.auditors || []); setChairs(data.chairs || []); }
  }
  useEffect(() => { loadStaff(); }, []);
  function reset() { setForm({ name: '', title: '', email: '', password: '' }); setEditing(null); }
  function edit(item: Auditor | Chair, itemKind: 'AUDITOR' | 'CHAIR') { setKind(itemKind); setEditing({ id: item.id, kind: itemKind }); setForm({ name: item.name, title: item.title || '', email: 'email' in item ? item.email : '', password: '' }); }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    const method = editing ? 'PATCH' : 'POST';
    const url = editing ? `/api/admin/staff/${editing.id}` : '/api/admin/staff';
    const body = editing ? { kind: editing.kind, name: form.name, title: form.title, email: form.email, password: form.password, active: true } : { kind, ...form };
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Tidak dapat menyimpan.'); else { setMessage('Data berhasil disimpan.'); reset(); await loadStaff(); }
    setBusy(false);
  }
  async function toggle(item: Auditor | Chair, itemKind: 'AUDITOR' | 'CHAIR') {
    await fetch(`/api/admin/staff/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: itemKind, name: item.name, title: item.title, email: 'email' in item ? item.email : undefined, active: !item.active }) });
    await loadStaff();
  }
  return <div className="space-y-6">
    <div><p className="mb-2 text-xs font-bold text-[#08725b]">Administrasi LPH UNEJ</p><h1 className="display-font text-3xl font-extrabold tracking-[-.05em] text-[#10211e]">Manajemen Pengguna</h1><p className="mt-1 text-sm text-[#71847f]">Kelola akun login, auditor, dan Ketua LPH dalam satu tempat.</p></div>
    <section className="overflow-hidden rounded-2xl border border-[#e2eeeb] bg-white"><div className="border-b border-[#edf3f1] px-5 py-5"><h2 className="display-font font-bold text-[#183b34]">Daftar Akun Login</h2><p className="mt-1 text-xs text-[#8a9b97]">Akun Penyelia, Admin, Super Admin, dan Auditor.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-[#fbfdfc] text-[10px] font-bold text-[#8a9b97]"><tr><th className="px-5 py-3">Nama</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Peran</th><th className="px-5 py-3">Instansi</th><th className="px-5 py-3">Terdaftar</th></tr></thead><tbody>{users.map(user => <tr key={user.id} className="border-t border-[#edf3f1] text-[#526b66]"><td className="px-5 py-4 font-semibold text-[#234940]">{user.name}</td><td className="px-5 py-4">{user.email}</td><td className="px-5 py-4"><span className="rounded-full bg-[#e7f5ef] px-2.5 py-1 text-[10px] font-bold text-[#08725b]">{user.role}</span></td><td className="px-5 py-4">{user.company || '-'}</td><td className="px-5 py-4">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(user.createdAt))}</td></tr>)}</tbody></table></div></section>
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]"><form onSubmit={save} className="rounded-2xl border border-[#dce9e5] bg-white p-5"><div className="mb-4 flex items-center gap-2"><UserRound size={18} className="text-[#08725b]"/><h2 className="display-font text-lg font-bold text-[#183b34]">{editing ? 'Edit Data' : 'Tambah Auditor / Ketua LPH'}</h2></div>{!editing && <div className="mb-4 flex gap-2"><button type="button" onClick={() => setKind('AUDITOR')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${kind === 'AUDITOR' ? 'bg-[#e7f5ef] text-[#08725b]' : 'bg-[#f5faf8] text-[#71847f]'}`}>Auditor</button><button type="button" onClick={() => setKind('CHAIR')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${kind === 'CHAIR' ? 'bg-[#e7f5ef] text-[#08725b]' : 'bg-[#f5faf8] text-[#71847f]'}`}>Ketua LPH</button></div>}<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" className="mb-3 h-10 w-full rounded-xl border border-[#dce9e5] px-3 text-xs outline-none focus:border-[#0a8065]"/>{kind === 'AUDITOR' && <><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email login auditor" required={!editing} className="mb-3 h-10 w-full rounded-xl border border-[#dce9e5] px-3 text-xs outline-none focus:border-[#0a8065]"/><input type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Password baru (kosongkan jika tidak diubah)' : 'Password minimal 8 karakter'} required={!editing} className="mb-3 h-10 w-full rounded-xl border border-[#dce9e5] px-3 text-xs outline-none focus:border-[#0a8065]"/></>}{message && <p className="mb-3 text-xs font-semibold text-[#08725b]">{message}</p>}<div className="flex gap-2"><button disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#08725b] px-4 py-3 text-xs font-bold text-white"><Plus size={14}/>{busy ? 'Menyimpan...' : 'Simpan'}</button>{editing && <button type="button" onClick={reset} className="rounded-xl border border-[#dce9e5] px-4 py-3 text-xs font-bold text-[#526b66]">Batal</button>}</div></form><div className="space-y-5"><section className="rounded-2xl border border-[#dce9e5] bg-white p-5"><h2 className="display-font mb-4 text-lg font-bold text-[#183b34]">Auditor</h2><div className="space-y-2">{auditors.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f5faf8] p-3"><div><p className="text-xs font-bold text-[#234940]">{item.name}</p><p className="mt-1 text-[10px] text-[#71847f]">{item.email} · {item.active ? 'Aktif' : 'Nonaktif'}</p></div><div className="flex gap-1"><button onClick={() => edit(item, 'AUDITOR')} className="rounded-lg p-2 text-[#08725b]" aria-label="Edit auditor"><Pencil size={14}/></button><button onClick={() => toggle(item, 'AUDITOR')} className="rounded-lg p-2 text-[#08725b]" aria-label="Ubah status auditor"><Check size={14}/></button></div></div>)}</div></section><section className="rounded-2xl border border-[#dce9e5] bg-white p-5"><h2 className="display-font mb-4 text-lg font-bold text-[#183b34]">Ketua LPH</h2><div className="space-y-2">{chairs.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f5faf8] p-3"><div><p className="text-xs font-bold text-[#234940]">{item.name}<span className="ml-2 text-[10px] font-normal text-[#71847f]">{item.active ? 'Aktif' : 'Nonaktif'}</span></p></div><div className="flex gap-1"><button onClick={() => edit(item, 'CHAIR')} className="rounded-lg p-2 text-[#08725b]" aria-label="Edit Ketua LPH"><Pencil size={14}/></button><button onClick={() => toggle(item, 'CHAIR')} className="rounded-lg p-2 text-[#08725b]" aria-label="Ubah status Ketua LPH"><Check size={14}/></button></div></div>)}</div></section></div></div>
  </div>;
}
