"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

type Props = {
  id: string;
  name: string;
  canDelete: boolean;
};

export function DeletePengajuanButton({ id, name, canDelete }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/pengajuan/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pengajuan gagal dihapus.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Koneksi terputus, pengajuan belum dihapus.");
    } finally {
      setBusy(false);
    }
  }

  if (!canDelete) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-[#f1cfc8] px-3 py-1.5 text-[10px] font-bold text-[#c54b39] transition hover:bg-[#fff4f2]"
      >
        <Trash2 size={12} /> Hapus
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus pengajuan"
          className="fixed inset-0 z-50 grid place-items-center bg-[#10211e]/45 p-4"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#e2eeeb] bg-white p-6 shadow-[0_24px_60px_rgba(16,33,30,.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#ffe6e2] text-[#c54b39]">
                <AlertTriangle size={20} />
              </div>
              <button
                type="button"
                onClick={() => !busy && setOpen(false)}
                aria-label="Tutup"
                className="grid h-8 w-8 place-items-center rounded-lg text-[#8a9b97] transition hover:bg-[#f5f9f8]"
              >
                <X size={16} />
              </button>
            </div>

            <h2 className="display-font mt-4 text-lg font-extrabold tracking-[-.03em] text-[#183b34]">
              Hapus pengajuan ini?
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#234940]">{name}</p>

            <div className="mt-4 rounded-xl border border-[#f4e3df] bg-[#fffaf9] p-4">
              <p className="text-xs leading-6 text-[#526b66]">
                Jika dihapus, <strong className="text-[#c54b39]">seluruh data
                pengajuan ini akan hilang permanen</strong> dan tidak dapat
                dikembalikan, meliputi:
              </p>
              <ul className="mt-2 space-y-1 text-[11px] leading-5 text-[#647873]">
                <li>· Data perusahaan dan pejabat penandatangan</li>
                <li>· Daftar produk dan bahan beserta bukti</li>
                <li>· Jawaban SJPH dan bukti yang dilampirkan</li>
                <li>· Hasil audit, temuan, dan riwayat perbaikan</li>
                <li>· Laporan Word yang pernah dihasilkan</li>
              </ul>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-[#ffe6e2] px-3 py-2 text-xs text-[#c54b39]">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="flex-1 rounded-xl border border-[#dce9e5] px-4 py-3 text-xs font-bold text-[#45655d] transition hover:bg-[#f5f9f8] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#c54b39] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#b0402f] disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} /> Ya, hapus permanen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
