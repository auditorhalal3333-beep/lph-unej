'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
  { label: 'Data Perusahaan', suffix: '' },
  { label: 'Produk', suffix: '/produk' },
  { label: 'Bahan', suffix: '/bahan' },
  { label: 'Implementasi SJPH', suffix: '/sjph' },
  { label: 'Review', suffix: '/review' },
];

export function PengajuanStepper({ applicationId, current }: { applicationId: string; current: number }) {
  const base = `/penyelia/pengajuan/${applicationId}`;
  const reviewHref = `${base}/review`;
  const previous = steps[current - 1];
  const next = steps[current + 1];
  return <div className="space-y-4">
    <div className="rounded-2xl border border-[#dce9e5] bg-white p-5">
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {steps.map((step, index) => <div key={step.label} className="flex min-w-[110px] flex-1 items-center gap-2">
          <Link href={index <= current ? `${base}${step.suffix}` : '#'} aria-current={index === current ? 'step' : undefined} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${index < current ? 'bg-[#08725b] text-white' : index === current ? 'bg-[#dff4ea] text-[#08725b]' : 'bg-[#f0f5f3] text-[#8a9b97]'}`}>{index < current ? <CheckCircle2 size={15} /> : index + 1}</Link>
          <span className={`hidden text-[10px] font-semibold lg:block ${index === current ? 'text-[#08725b]' : 'text-[#8a9b97]'}`}>{step.label}</span>
          {index < steps.length - 1 && <div className="mx-1 h-px flex-1 bg-[#e5efec]" />}
        </div>)}
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf3f1] pt-4">
      {previous ? <Link href={`${base}${previous.suffix}`} className="inline-flex items-center gap-2 rounded-xl border border-[#dce9e5] bg-white px-4 py-2.5 text-xs font-bold text-[#526b66]"><ArrowLeft size={14} /> Sebelumnya</Link> : <span />}
      {next ? <Link href={`${base}${next.suffix}`} className="inline-flex items-center gap-2 rounded-xl bg-[#08725b] px-4 py-2.5 text-xs font-bold text-white">Selanjutnya <ArrowRight size={14} /></Link> : <Link href={reviewHref} className="inline-flex items-center gap-2 rounded-xl bg-[#08725b] px-4 py-2.5 text-xs font-bold text-white">Lihat Review <ArrowRight size={14} /></Link>}
    </div>
  </div>;
}
