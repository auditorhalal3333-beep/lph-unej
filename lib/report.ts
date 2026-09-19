import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { ingredientDescription } from './domain';

const PAGE_WIDTH = 9360;
const FONT = 'Cambria';
const small = 17;
const normal = 19;
const heading = 24;

type CellOptions = {
  bold?: boolean;
  shade?: string;
  align?: typeof AlignmentType[keyof typeof AlignmentType];
  vertical?: typeof VerticalAlign[keyof typeof VerticalAlign];
};

function paragraphs(text: string, options: CellOptions = {}) {
  const lines = String(text || '-').split('\n');
  return lines.map((line) => new Paragraph({
    alignment: options.align,
    spacing: { after: 40, line: 240 },
    children: [new TextRun({ text: line || ' ', bold: options.bold, font: FONT, size: small })],
  }));
}

function cell(text: string, width: number, options: CellOptions = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: options.vertical === VerticalAlign.CENTER ? VerticalAlign.CENTER : VerticalAlign.TOP,
    shading: options.shade ? { type: ShadingType.CLEAR, fill: options.shade } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: paragraphs(text, options),
  });
}

function reportTable(headers: string[], rows: string[][], widths?: number[]) {
  const columnWidths = widths || headers.map(() => Math.floor(PAGE_WIDTH / headers.length));
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
  };
  return new Table({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    columnWidths,
    borders,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((header, index) => cell(header, columnWidths[index], { bold: true, shade: 'D9E1E2', align: AlignmentType.CENTER })) }),
      ...rows.map((row) => new TableRow({ cantSplit: true, children: row.map((value, index) => cell(value, columnWidths[index])) })),
    ],
  });
}

function title(text: string, size = heading) {
  return new Paragraph({
    spacing: { before: 180, after: 120 },
    children: [new TextRun({ text, bold: true, font: FONT, size })],
  });
}

function centeredTitle(text: string, size: number) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text, bold: true, font: FONT, size })] });
}

function numbered(items: string[]) {
  return items.filter(Boolean).map((item, index) => `${index + 1}) ${item}`).join('\n');
}

function dateText(value: unknown) {
  return value ? new Date(String(value)).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';
}

function officialsText(application: any) {
  const officials = application.officials?.length ? application.officials : [{ name: application.companyOfficialName || application.ownerName || '-', title: null }];
  return officials.map((official: any, index: number) => `${index + 1}. ${official.name}${official.title ? ` (${official.title})` : ''}`).join('\n');
}

function auditorText(application: any) {
  return application.assignments?.length
    ? application.assignments.map((assignment: any, index: number) => `${index + 1}. ${assignment.auditorName || assignment.auditor?.name || '-'}${assignment.auditorTitle ? `, ${assignment.auditorTitle}` : ''}`).join('\n')
    : '-';
}

function evidenceText(response: any) {
  const evidence = [response?.providerNotes, ...(response?.evidences || []).map((item: any) => item.fileName ? `${item.fileName}: ${item.url}` : item.url)].filter(Boolean);
  return evidence.length ? evidence.join('\n') : 'Belum diisi oleh penyelia';
}

function resultText(category: any, criteria: any[], results: any[]) {
  const labels: Record<string, string> = { SESUAI: 'Sesuai', PERLU_PERBAIKAN: 'Perlu Perbaikan', TIDAK_SESUAI: 'Tidak Sesuai', TIDAK_BERLAKU: 'Tidak Berlaku' };
  return criteria.map((criterion: any, index: number) => {
    const audit = results.find((item: any) => item.section === category.code && item.criterion === criterion.title);
    const response = criterion.response;
    const result = audit?.result || response?.auditorResult;
    const note = audit?.note || response?.auditorNotes;
    return `${index + 1}) ${labels[result] || 'Belum diperiksa'}${note ? ` — ${note}` : ''}`;
  }).join('\n');
}

export function buildAuditReport(application: any) {
  const sections: (Paragraph | Table)[] = [];
  const factory = application.factoryName || application.companyName || '-';
  const address = application.address || '-';
  const categories = application.sjphCategories?.length
    ? application.sjphCategories
    : ['KOMITMEN', 'BAHAN', 'PROSES', 'PRODUK', 'EVALUASI'].map((code, index) => ({ code, name: code, sortOrder: index }));
  const responses = application.sjphResponses || [];
  const auditResults = application.auditResults || [];

  sections.push(centeredTitle('LAPORAN HASIL AUDIT HALAL', 30));
  sections.push(centeredTitle('LEMBAGA PEMERIKSA HALAL UNIVERSITAS JEMBER', 20));
  sections.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { before: 300, after: 180, line: 280 }, children: [new TextRun({ font: FONT, size: normal, text: `Dengan ini dilaporkan hasil pemeriksaan/auditing oleh Tim LPH UNEJ pada ${factory} yang beralamat di ${address}.` })] }));
  sections.push(reportTable(['Data Pengajuan', 'Keterangan'], [
    ['Nomor Audit', application.auditNumber || '-'],
    ['Nama Pabrik / Usaha', factory],
    ['Nama Perusahaan', application.companyName || '-'],
    ['Alamat Pabrik', address],
    ['Tanggal Audit', dateText(application.auditDate)],
    ['NIB', application.nib || '-'],
    ['STTD', application.sttd || '-'],
    ['Auditor', auditorText(application)],
    ['Nama Pejabat Perusahaan', officialsText(application)],
  ], [2600, 6760]));
  sections.push(new Paragraph({ spacing: { before: 260, after: 260 }, children: [new TextRun({ text: `STATUS PENDAFTARAN: ${application.registrationType || 'SERTIFIKASI BARU'}`, bold: true, font: FONT, size: normal })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300, after: 120 }, children: [new TextRun({ text: `Jember, ${dateText(application.auditDate)}`, font: FONT, size: normal })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [new TextRun({ text: 'Pimpinan LPH\n\n\n____________________________', bold: true, font: FONT, size: normal })] }));

  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(title(`Kelompok Produk: ${application.productGroup || '-'}`));
  sections.push(title('Daftar Produk', 21));
  sections.push(reportTable(['No.', 'Nama Produk', 'Jenis Produk', 'Kode Produksi'], (application.products || []).map((product: any, index: number) => [String(index + 1), product.name, product.type || '-', product.productionCode || '-']), [700, 3900, 3000, 1760]));
  sections.push(title('Daftar Bahan', 21));
  sections.push(reportTable(['No.', 'Bahan', 'Diragukan', 'Temuan / Sertifikat', 'Keterangan'], (application.ingredients || []).map((item: any, index: number) => [String(index + 1), item.name, item.hasSH ? 'V' : '-', item.hasSH ? `SH BPJPH No. ${item.shNumber || '-'}` : '-', ingredientDescription(item)]), [600, 2500, 1200, 2800, 2260]));

  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(centeredTitle('IMPLEMENTASI SJPH', 24));
  sections.push(new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: address, font: FONT, size: normal })] }));
  const sjphRows = categories.map((category: any) => {
    const categoryResponses = responses.filter((response: any) => response.criterion?.category?.code === category.code);
    const criteria = (category.criteria || []).map((criterion: any) => ({ ...criterion, response: responses.find((response: any) => response.criterionId === criterion.id) }));
    const usableCriteria = criteria.length ? criteria : categoryResponses.map((response: any) => ({ ...response.criterion, response }));
    return [
      category.name || category.code,
      numbered(usableCriteria.map((criterion: any) => criterion.title)),
      resultText(category, usableCriteria, auditResults),
      numbered(usableCriteria.map((criterion: any) => evidenceText(criterion.response))),
    ];
  });
  sections.push(reportTable(['Kriteria', 'Hasil Audit', 'Status / Catatan Auditor', 'Bukti/Keterangan'], sjphRows, [1900, 2500, 2500, 2460]));

  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(title('RINGKASAN HASIL PEMERIKSAAN DAN RENCANA TINDAK LANJUT', 24));
  sections.push(new Paragraph({ children: [new TextRun({ text: '(disampaikan saat closing meeting)', italics: true, font: FONT, size: normal })] }));
  sections.push(reportTable(['Auditor Halal / Catatan Closing Meeting'], [[auditResults.map((item: any) => item.note).filter(Boolean).filter((value: string, index: number, values: string[]) => values.indexOf(value) === index).join('\n') || 'Belum ada catatan closing meeting.']], [9360]));
  const findingRows = (application.temuan || []).map((finding: any, index: number) => {
    const fixes = (finding.fixes || []).map((fix: any) => `${fix.notes || 'Perbaikan'}${fix.evidenceUrl ? `\n${fix.evidenceUrl}` : ''}`).join('\n') || '-';
    const verification = (finding.verifications || []).map((item: any) => `${item.result}${item.note ? `: ${item.note}` : ''}`).join('\n');
    return [String(index + 1), finding.description, fixes, verification || finding.status || 'OPEN'];
  });
  sections.push(reportTable(['No.', 'Temuan', 'Perbaikan', 'Status / Verifikasi'], findingRows.length ? findingRows : [['-', 'Belum ada temuan yang dicatat.', '-', '-']], [600, 3700, 3000, 2060]));
  sections.push(new Paragraph({ spacing: { before: 350 }, children: [new TextRun({ text: `Jember, ${dateText(application.auditDate)}`, font: FONT, size: normal })] }));
  sections.push(reportTable(['Lead Auditor / Ketua LPH', 'Auditee / Pejabat Perusahaan'], [[`Ketua LPH: ${application.leadLphName || '-'}\nAuditor:\n${auditorText(application)}\n\nTanda tangan:\n\n____________________________`, `Nama:\n${officialsText(application)}\n\nTanda tangan:\n\n____________________________`]], [4680, 4680]));

  return new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: sections }] });
}
