import { Document, HeadingLevel, PageBreak, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, BorderStyle, ShadingType, AlignmentType } from 'docx';
import { ingredientDescription } from './domain';

const cell = (text: string, width: number, bold = false) => new TableCell({ width: { size: width, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: text || '-', bold, size: 18 })] })] });
const table = (headers: string[], rows: string[][]) => new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: headers.map(() => Math.floor(9360 / headers.length)), rows: [new TableRow({ tableHeader: true, children: headers.map(h => cell(h, Math.floor(9360 / headers.length), true)) }), ...rows.map(row => new TableRow({ children: row.map(value => cell(value, Math.floor(9360 / headers.length))) }))] });
const numbered = (items: string[]) => items.filter(Boolean).map((item, index) => `${index + 1}) ${item}`).join('\n');

export function buildAuditReport(application: any) {
  const sections: (Paragraph | Table)[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'LAPORAN HASIL AUDIT HALAL', bold: true, size: 30 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'LEMBAGA PEMERIKSA HALAL UNIVERSITAS JEMBER', bold: true, size: 20 })] }),
    new Paragraph({ spacing: { before: 500, after: 100 }, children: [new TextRun({ text: 'Nomor Audit: ', bold: true }), new TextRun(application.auditNumber)] }),
    new Paragraph(`Nama Pabrik / Usaha: ${application.factoryName || application.companyName}`),
    new Paragraph(`Nama Perusahaan: ${application.companyName}`),
    new Paragraph(`Alamat: ${application.address}`),
    new Paragraph(`NIB: ${application.nib || '-'}`),
    new Paragraph(`STTD: ${application.sttd || '-'}`),
    new Paragraph(`Tanggal Audit: ${application.auditDate ? new Date(application.auditDate).toLocaleDateString('id-ID') : '-'}`),
    new Paragraph(`Auditor: ${application.assignments?.map((a: any) => `${a.auditorName || a.auditor?.name || '-'}${a.auditorTitle ? `, ${a.auditorTitle}` : ''}`).join('; ') || '-'}`),
    new Paragraph(`Jenis Pendaftaran: ${application.registrationType || '-'}`),
    new Paragraph(`Kelompok Produk: ${application.productGroup || '-'}`),
    new Paragraph({ spacing: { before: 500 }, children: [new TextRun({ text: 'DAFTAR PRODUK', bold: true, size: 24 })] }),
    table(['No.', 'Nama Produk', 'Jenis Produk', 'Kode Produksi'], (application.products || []).map((p: any, i: number) => [String(i + 1), p.name, p.type, p.productionCode || '-'])),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ children: [new TextRun({ text: 'DAFTAR BAHAN', bold: true, size: 24 })] }),
    table(['No.', 'Bahan', 'Diragukan', 'Temuan', 'Keterangan'], (application.ingredients || []).map((item: any, i: number) => [String(i + 1), item.name, item.hasSH ? 'V' : '-', '-', ingredientDescription(item)])),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ children: [new TextRun({ text: 'IMPLEMENTASI SJPH', bold: true, size: 24 })] }),
  ];
  const responses = application.sjphResponses || [];
  const resultLabel: Record<string, string> = { SESUAI: 'Sesuai', PERLU_PERBAIKAN: 'Perlu Perbaikan', TIDAK_SESUAI: 'Tidak Sesuai', TIDAK_BERLAKU: 'Tidak Berlaku' };
  for (const category of ['KOMITMEN', 'BAHAN', 'PROSES', 'PRODUK', 'EVALUASI']) {
    const items = responses.filter((r: any) => r.criterion?.category?.code === category).sort((a: any, b: any) => (a.criterion?.sortOrder || 0) - (b.criterion?.sortOrder || 0));
    if (items.length) {
      const audits = items.map((r: any) => (application.auditResults || []).find((item: any) => item.section === category && item.criterion === r.criterion.title) || r);
      const counts = audits.reduce((summary: Record<string, number>, audit: any) => { const key = resultLabel[audit?.result || audit?.auditorResult] || 'Belum diperiksa'; summary[key] = (summary[key] || 0) + 1; return summary; }, {});
      const statusSummary = Object.entries(counts).map(([label, count]) => `${label}: ${count}`).join('; ');
      const comments = [...new Set(audits.map((audit: any) => audit?.note || audit?.auditorNotes).filter(Boolean))] as string[];
      const auditItems = [statusSummary || 'Belum diperiksa', ...comments];
      const evidenceItems = items.map((r: any) => {
        const evidence = [r.providerNotes, ...(r.evidences || []).map((e: any) => e.url)].filter(Boolean);
        return `${r.criterion.title}: ${evidence.length ? evidence.join(' · ') : 'Belum diisi'}`;
      });
      sections.push(new Paragraph({ spacing: { before: 300 }, children: [new TextRun({ text: items[0].criterion.category.name, bold: true, size: 21 })] }));
      sections.push(table(['Kriteria', 'Hasil Audit', 'Bukti / Keterangan'], [[items[0].criterion.category.name, numbered(auditItems), numbered(evidenceItems)]]));
    }
  }
  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'RINGKASAN HASIL PEMERIKSAAN DAN RENCANA TINDAK LANJUT', bold: true, size: 24 })] }));
  sections.push(table(['No.', 'Temuan', 'Perbaikan', 'Status'], (application.temuan || []).map((f: any, i: number) => [String(i + 1), f.description, (f.fixes || []).map((x: any) => x.notes || x.evidenceUrl).join('\n') || '-', f.status])));
  sections.push(new Paragraph({ spacing: { before: 700 }, children: [new TextRun({ text: 'Auditor / Tim Pemeriksa: ________________________________', size: 20 })] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Penyelia / Penanggung Jawab: ___________________________', size: 20 })] }));
  return new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: sections }] });
}
