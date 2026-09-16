import { ShieldCheck } from 'lucide-react';

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl shadow-sm ${inverse ? 'bg-[#f2c84b] text-[#075b49]' : 'bg-[#f2c84b] text-[#075b49]'}`}>
        <ShieldCheck size={25} strokeWidth={2.4} />
      </div>
      <div className="leading-none">
        <div className={`display-font text-[17px] font-extrabold tracking-[-.03em] ${inverse ? 'text-white' : 'text-[#073f34]'}`}>LPH UNEJ</div>
        <div className={`mt-1 text-[10px] font-medium ${inverse ? 'text-white/75' : 'text-[#59716c]'}`}>Lembaga Pemeriksa Halal</div>
        <div className={`mt-0.5 text-[10px] font-medium ${inverse ? 'text-white/75' : 'text-[#59716c]'}`}>Universitas Jember</div>
      </div>
    </div>
  );
}
