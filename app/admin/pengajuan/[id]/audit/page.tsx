'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function AuditPage() {
  const params = useParams();
  const [temuan, setTemuan] = useState<any[]>([]);
  const [form, setForm] = useState({ section: '', description: '' });

  const handleAddTemuan = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/temuan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pengajuanId: params.id, ...form }),
    });
    if (res.ok) {
      const data = await res.json();
      setTemuan([...temuan, data]);
      setForm({ section: '', description: '' });
    }
  };

  const handleVerify = async (id: string) => {
    await fetch(`/api/temuan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SELESAI' }),
    });
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Audit Pengajuan</h1>

      <form onSubmit={handleAddTemuan} className="card bg-base-200 p-4 space-y-4">
        <h2 className="text-lg font-bold">Tambah Temuan</h2>
        <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="select select-bordered w-full">
          <option value="">Pilih Bagian</option>
          <option value="KOMITMEN">Komitmen dan Tanggung Jawab</option>
          <option value="BAHAN">Bahan</option>
          <option value="PROSES">Proses Produk Halal</option>
          <option value="PRODUK">Produk</option>
          <option value="EVALUASI">Pemantauan dan Evaluasi</option>
        </select>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi temuan" className="textarea textarea-bordered w-full" required />
        <button type="submit" className="btn btn-primary">Tambah Temuan</button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Daftar Temuan</h2>
        {temuan.map((t: any, i: number) => (
          <div key={i} className="card bg-base-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{t.section}</div>
                <div>{t.description}</div>
                <div className="text-sm text-gray-500">Status: {t.status}</div>
              </div>
              <button onClick={() => handleVerify(t.id)} className="btn btn-sm btn-success">Verifikasi</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
