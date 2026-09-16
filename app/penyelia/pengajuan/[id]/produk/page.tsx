'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function ProdukPage() {
  const params = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', type: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pengajuanId: params.id, ...form }),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts([...products, data]);
      setForm({ name: '', type: '' });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Daftar Produk</h1>
      <form onSubmit={handleAdd} className="flex gap-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Produk" className="input input-bordered" required />
        <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Jenis" className="input input-bordered" required />
        <button type="submit" className="btn btn-primary">Tambah</button>
      </form>
      <ul className="space-y-2">
        {products.map((p: any, i: number) => (
          <li key={i} className="card bg-base-200 p-4">
            <div className="font-bold">{p.name}</div>
            <div>{p.type}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
