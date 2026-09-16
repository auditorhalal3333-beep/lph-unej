'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function BahanPage() {
  const params = useParams();
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', brand: '', producer: '', supplier: '', hasSH: false, shNumber: '', shDate: '', notes: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pengajuanId: params.id, ...form }),
    });
    if (res.ok) {
      const data = await res.json();
      setIngredients([...ingredients, data]);
      setForm({ name: '', brand: '', producer: '', supplier: '', hasSH: false, shNumber: '', shDate: '', notes: '' });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Daftar Bahan</h1>
      <form onSubmit={handleAdd} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Bahan" className="input input-bordered" required />
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Merek" className="input input-bordered" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input value={form.producer} onChange={(e) => setForm({ ...form, producer: e.target.value })} placeholder="Produsen" className="input input-bordered" />
          <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier" className="input input-bordered" />
        </div>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer flex items-center gap-2">
            <input type="checkbox" checked={form.hasSH} onChange={(e) => setForm({ ...form, hasSH: e.target.checked })} className="checkbox" />
            <span>Memiliki SH</span>
          </label>
          {form.hasSH && (
            <>
              <input value={form.shNumber} onChange={(e) => setForm({ ...form, shNumber: e.target.value })} placeholder="Nomor SH" className="input input-bordered" />
              <input type="date" value={form.shDate} onChange={(e) => setForm({ ...form, shDate: e.target.value })} className="input input-bordered" />
            </>
          )}
        </div>
        <button type="submit" className="btn btn-primary">Tambah</button>
      </form>
      <ul className="space-y-2">
        {ingredients.map((i: any, idx: number) => (
          <li key={idx} className="card bg-base-200 p-4">
            <div className="font-bold">{i.name}</div>
            <div>{i.brand} - {i.producer}</div>
            {i.hasSH && <div className="text-sm text-green-600">SH: {i.shNumber}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
