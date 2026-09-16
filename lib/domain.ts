export const APPLICATION_STATUSES = ['DRAFT', 'DIAJUKAN', 'MENUNGGU_REVIEW', 'MENUNGGU_AUDITOR', 'SEDANG_DIAUDIT', 'PERLU_PERBAIKAN', 'MENUNGGU_VERIFIKASI', 'SELESAI'] as const;
export const AUDIT_RESULTS = ['SESUAI', 'TIDAK_SESUAI', 'PERLU_PERBAIKAN', 'TIDAK_BERLAKU'] as const;

export function ingredientDescription(ingredient: { hasSH: boolean; shNumber?: string | null; shDate?: Date | string | null; producer?: string | null }) {
  if (!ingredient.hasSH) return 'Bahan belum memiliki Sertifikat Halal; diperlukan pemeriksaan dan penjelasan pendukung.';
  const date = ingredient.shDate ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(ingredient.shDate)) : 'tanggal tidak dicantumkan';
  const producer = ingredient.producer ? ` (bahan dari produsen ${ingredient.producer})` : '';
  return `V SH BPJPH NO. ${ingredient.shNumber ?? '-'}\nDiterbitkan pada tanggal ${date}${producer}`;
}

export function statusLabel(status: string) {
  return ({ DRAFT: 'Draft', DIAJUKAN: 'Diajukan', MENUNGGU_REVIEW: 'Menunggu Review', MENUNGGU_AUDITOR: 'Menunggu Auditor', SEDANG_DIAUDIT: 'Sedang Diaudit', PERLU_PERBAIKAN: 'Perlu Perbaikan', MENUNGGU_VERIFIKASI: 'Menunggu Verifikasi', SELESAI: 'Selesai' } as Record<string, string>)[status] ?? status;
}
