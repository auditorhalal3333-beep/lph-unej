import { BrandMark } from './brand-mark';
import { ShieldCheck, Sparkles } from 'lucide-react';

export function AuthShell({ children, mode }: { children: React.ReactNode; mode: 'login' | 'register' }) {
  return <main className="grid min-h-screen bg-[#f7fbfa] lg:grid-cols-[minmax(340px,.72fr)_minmax(500px,1fr)]">
    <aside className="relative hidden overflow-hidden bg-[#075b49] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -bottom-20 -left-24 h-80 w-80 rounded-full border-[28px] border-white/10" /><div className="absolute bottom-3 left-[-20px] h-56 w-56 rotate-45 rounded-[35%] border-[18px] border-white/10" />
      <div className="relative z-10"><BrandMark inverse /><div className="mt-16 h-0.5 w-8 bg-white" /><h1 className="display-font mt-6 max-w-xs text-4xl font-bold leading-tight">Profesional<br />Amanah<br />Terpercaya</h1><p className="mt-6 max-w-xs text-sm leading-6 text-white/75">Bersama mewujudkan ekosistem halal yang berkualitas melalui audit dan pendampingan yang profesional.</p></div>
      <div className="relative z-10 flex items-center gap-2 text-xs italic text-white/80"><Sparkles size={14} /> “Halal adalah jalan menuju keberkahan”</div>
    </aside>
    <section className="flex items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-[480px]"> <div className="mb-9 lg:hidden"><BrandMark /></div>{children}<div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#71847f]"><ShieldCheck size={14} className="text-[#08725b]" /> Data Anda terlindungi dan aman</div></div></section>
  </main>;
}
