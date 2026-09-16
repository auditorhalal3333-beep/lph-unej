'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPengajuan() {
  const router = useRouter();
  const [form, setForm] = useState({
    type: 'PELAKU_USAHA',
    companyName: '',
    factoryName: '',
    ownerName: '',
    address: '',
    nib: '',
    sttd: '',
    supervisor: '',
    contact: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/pengajuan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/penyelia/pengajuan/${data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Buat Pengajuan Baru</h1>
      
      <div className="form-control">
        <label className="label">Jenis Pengajuan</label>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select select-bordered">
          <option value="PELAKU_USAHA">Pelaku Usaha</option>
          <option value="SPPG">SPPG</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">Nama Perusahaan</label>
        <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input input-bordered" required />
      </div>

      <div className="form-control">
        <label className="label">Nama Pabrik</label>
        <input type="text" value={form.factoryName} onChange={(e) => setForm({ ...form, factoryName: e.target.value })} className="input input-bordered" required />
      </div>

      <div className="form-control">
        <label className="label">Pemilik/Penanggung Jawab</label>
        <input type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="input input-bordered" required />
      </div>

      <div className="form-control">
        <label className="label">Alamat</label>
        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="textarea textarea-bordered" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">NIB</label>
          <input type="text" value={form.nib} onChange={(e) => setForm({ ...form, nib: e.target.value })} className="input input-bordered" />
        </div>
        <div className="form-control">
          <label className="label">STTD</label>
          <input type="text" value={form.sttd} onChange={(e) => setForm({ ...form, sttd: e.target.value })} className="input input-bordered" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">Penyelia</label>
          <input type="text" value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} className="input input-bordered" />
        </div>
        <div className="form-control">
          <label className="label">Kontak</label>
          <input type="text" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="input input-bordered" />
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full">Simpan</button>
    </form>
  );
}
