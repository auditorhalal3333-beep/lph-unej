import { Document, HeadingLevel, PageBreak, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, BorderStyle, ShadingType, AlignmentType } from 'docx';
import { ingredientDescription } from './domain';

const cell = (text: string, width: number, bold = false) => new TableCell({ width: { size: width, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: text || '-', bold, size: 18 })] })] });
const table = (headers: string[], rows: string[][]) => new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: headers.map(() => Math.floor(9360 / headers.length)), rows: [new TableRow({ tableHeader: true, children: headers.map(h => cell(h, Math.floor(9360 / headers.length), true)) }), ...rows.map(row => new TableRow({ children: row.map(value => cell(value, Math.floor(9360 / headers.length))) }))] });

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
  for (const category of ['KOMITMEN', 'BAHAN', 'PROSES', 'PRODUK', 'EVALUASI']) {
    const items = responses.filter((r: any) => r.criterion?.category?.code === category);
    if (items.length) { sections.push(new Paragraph({ spacing: { before: 300 }, children: [new TextRun({ text: items[0].criterion.category.name, bold: true, size: 21 })] })); sections.push(table(['Kriteria', 'Hasil Audit', 'Bukti / Keterangan'], items.map((r: any) => [r.criterion.title, r.auditorResult || 'Belum diperiksa', [r.providerNotes, ...(r.evidences || []).map((e: any) => e.url)].filter(Boolean).join('\n')]))); }
  }
  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'RINGKASAN HASIL PEMERIKSAAN DAN RENCANA TINDAK LANJUT', bold: true, size: 24 })] }));
  sections.push(table(['No.', 'Temuan', 'Perbaikan', 'Status'], (application.temuan || []).map((f: any, i: number) => [String(i + 1), f.description, (f.fixes || []).map((x: any) => x.notes || x.evidenceUrl).join('\n') || '-', f.status])));
  sections.push(new Paragraph({ spacing: { before: 700 }, children: [new TextRun({ text: 'Auditor / Tim Pemeriksa: ________________________________', size: 20 })] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Penyelia / Penanggung Jawab: ___________________________', size: 20 })] }));
  return new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: sections }] });
}
