'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('credentials', { email, password, callbackUrl: '/dashboard' });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold">Login</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input input-bordered w-full" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input input-bordered w-full" />
      <button type="submit" className="btn btn-primary w-full">Login</button>
    </form>
  );
}
