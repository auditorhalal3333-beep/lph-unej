'use client';

import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SubmitApplicationButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true);
    setError('');
    const response = await fetch(`/api/pengajuan/${applicationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'DIAJUKAN',
        description: 'Pengajuan dikirim oleh penyelia untuk direview admin.',
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Pengajuan tidak dapat dikirim.');
      setBusy(false);
      return;
    }
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl bg-[#08725b] px-4 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
        {busy ? 'Mengirim...' : 'Kirim untuk Review'}
      </button>
      {error && <p className="text-xs font-semibold text-[#c54b39]">{error}</p>}
    </div>
  );
}
