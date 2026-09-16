'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold">Register</h1>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama" className="input input-bordered w-full" required />
      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input input-bordered w-full" required />
      <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="input input-bordered w-full" required />
      <button type="submit" className="btn btn-primary w-full">Register</button>
    </form>
  );
}
