'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PengajuanStepper } from '@/components/pengajuan-stepper';

export default function ProdukPage() {
  const params = useParams<{ id: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ name: '', type: '' });
  useEffect(() => { fetch(`/api/products?pengajuanId=${params.id}`).then(r => r.json()).then(data => { setProducts(Array.isArray(data) ? data : []); setLoaded(true); }); }, [params.id]);
  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pengajuanId: params.id, ...form }) }); if (res.ok) { const data = await res.json(); setProducts([...products, data]); setForm({ name: '', type: '' }); } };
  return <div className="space-y-4 p-4"><PengajuanStepper applicationId={params.id} current={1} /><div className="rounded-2xl border border-[#dce9e5] bg-white p-6 shadow-[0_6px_20px_rgba(7,91,73,.035)]"><h1 className="display-font mb-5 text-xl font-bold text-[#183b34]">Daftar Produk</h1><form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama Produk" className="h-11 rounded-xl border border-[#dce9e5] bg-[#fbfdfc] px-3 text-xs outline-none focus:border-[#0a8065]" required /><input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="Jenis Produk" className="h-11 rounded-xl border border-[#dce9e5] bg-[#fbfdfc] px-3 text-xs outline-none focus:border-[#0a8065]" required /><button type="submit" className="rounded-xl bg-[#08725b] px-5 py-3 text-xs font-bold text-white">Tambah Produk</button></form></div><ul className="space-y-3">{!loaded ? <li className="rounded-2xl border border-[#dce9e5] bg-white p-6 text-sm text-[#71847f]">Memuat produk...</li> : products.length === 0 ? <li className="rounded-2xl border border-dashed border-[#cfe2dc] bg-white p-10 text-center text-sm text-[#71847f]">Belum ada produk ditambahkan.</li> : products.map((p: any, i: number) => <li key={i} className="flex items-center justify-between rounded-2xl border border-[#dce9e5] bg-white p-5"><div><div className="text-sm font-bold text-[#234940]">{p.name}</div><div className="mt-1 text-xs text-[#71847f]">{p.type}</div></div><span className="rounded-full bg-[#e7f5ef] px-3 py-1 text-[10px] font-bold text-[#08725b]">Produk {i + 1}</span></li>)}</ul></div>;
}
