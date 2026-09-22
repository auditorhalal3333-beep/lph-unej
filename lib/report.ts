import {
  AlignmentType,
  BorderStyle,
  Document,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { ingredientDescription } from './domain';

const WIDTH = 9360;
const FONT = 'Cambria';
const FONT_SIZE = 24; // 12 pt in OOXML half-points
const LINE = 276; // 1.15 line spacing
const text = (value: unknown) => String(value ?? '').trim() || '-';
const dateText = (value: unknown) => value ? new Date(String(value)).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

function line(value: unknown, bold = false, size = FONT_SIZE) {
  return new Paragraph({ spacing: { after: 0, line: LINE }, children: [new TextRun({ text: text(value), font: FONT, size, bold })] });
}

function multiline(value: unknown, bold = false) {
  return String(value || '-').split('\n').map((item) => line(item, bold));
}

function cell(value: unknown, width: number, bold = false, shade?: string) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shade ? { type: ShadingType.CLEAR, fill: shade } : undefined,
    margins: { top: 70, bottom: 70, left: 90, right: 90 },
    children: multiline(value, bold),
  });
}

function borderedTable(headers: string[], rows: string[][], widths: number[]) {
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
  };
  return new Table({
    width: { size: WIDTH, type: WidthType.DXA }, columnWidths: widths, borders,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((header, i) => cell(header, widths[i], true, 'D9E1E2')) }),
      ...rows.map((row) => new TableRow({ cantSplit: true, children: row.map((value, i) => cell(value, widths[i])) })),
    ],
  });
}

function valueTable(rows: [string, string][]) {
  const borders = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };
  return new Table({
    width: { size: WIDTH, type: WidthType.DXA }, columnWidths: [2500, 180, 6680], borders,
    rows: rows.map(([label, value]) => new TableRow({ children: [cell(label, 2500, true), cell(':', 180), cell(value, 6680)] })),
  });
}

function boxed(value: string) {
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };
  return new Table({
    width: { size: WIDTH, type: WidthType.DXA }, columnWidths: [WIDTH], borders,
    rows: [new TableRow({ children: [cell(value, WIDTH, true)] })],
  });
}

function centered(value: string, bold = true) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0, line: LINE }, children: [new TextRun({ text: value, font: FONT, size: FONT_SIZE, bold })] });
}

function blank(lines = 1) {
  return Array.from({ length: lines }, () => new Paragraph({ spacing: { before: 0, after: 0, line: LINE }, children: [new TextRun({ text: '', font: FONT, size: FONT_SIZE })] }));
}

function sectionTitle(value: string) {
  return new Paragraph({ spacing: { before: 0, after: 0, line: LINE }, children: [new TextRun({ text: value, font: FONT, size: FONT_SIZE, bold: true })] });
}

function summaryBox(summaryText: string, auditorHalal: string) {
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };
  return new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: [WIDTH],
    borders,
    rows: [
      new TableRow({
        children: [new TableCell({
          width: { size: WIDTH, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'D9E1E2' },
          margins: { top: 90, bottom: 90, left: 90, right: 90 },
          children: [
            new Paragraph({ spacing: { after: 0, line: LINE }, children: [new TextRun({ text: 'RINGKASAN HASIL PEMERIKSAAN DAN RENCANA TINDAK LANJUT', font: FONT, size: FONT_SIZE, bold: true })] }),
            new Paragraph({ spacing: { after: 0, line: LINE }, children: [new TextRun({ text: '(disampaikan saat closing meeting)', font: FONT, size: FONT_SIZE, italics: true })] }),
            new Paragraph({ spacing: { before: 80, after: 0, line: LINE }, children: [new TextRun({ text: 'Auditor Halal:', font: FONT, size: FONT_SIZE, bold: true })] }),
          ],
        })],
      }),
      new TableRow({
        cantSplit: true,
        children: [cell(summaryText || 'Belum diisi oleh auditor.', WIDTH)],
      }),
    ],
  });
}

function numbered(values: string[]) {
  return values.filter(Boolean).map((value, index) => `${index + 1}) ${value}`).join('\n');
}

function officialNames(application: any) {
  const officials = application.officials?.length ? application.officials : [{ name: application.companyOfficialName || application.ownerName || '-', title: null }];
  return officials.map((item: any, index: number) => `${index + 1}. ${text(item.name)}${item.title ? ` (${item.title})` : ''}`).join('\n');
}

function auditorNames(application: any) {
  return application.assignments?.length ? application.assignments.map((item: any, index: number) => `${index + 1}. ${text(item.auditorName || item.auditor?.name)}${item.auditorTitle ? `, ${item.auditorTitle}` : ''}`).join('\n') : '-';
}

function evidence(response: any) {
  const values = [response?.providerNotes, ...(response?.evidences || []).map((item: any) => item.url || item.fileName)].filter(Boolean);
  return values.length ? values.join('\n') : 'Belum diisi oleh penyelia';
}

const resultLabels: Record<string, string> = { SESUAI: 'Sesuai', PERLU_PERBAIKAN: 'Perlu Perbaikan', TIDAK_SESUAI: 'Tidak Sesuai', TIDAK_BERLAKU: 'Tidak Berlaku' };

export function buildAuditReport(application: any) {
  const sections: (Paragraph | Table)[] = [];
  const factory = text(application.factoryName || application.companyName);
  const address = text(application.address);
  const responses = application.sjphResponses || [];
  const results = application.auditResults || [];
  const categories = application.sjphCategories?.length ? application.sjphCategories : ['KOMITMEN', 'BAHAN', 'PROSES', 'PRODUK', 'EVALUASI'].map((code, sortOrder) => ({ code, name: code, sortOrder, criteria: [] }));

  sections.push(centered('LAPORAN HASIL AUDIT HALAL'));
  sections.push(...blank(2));
  sections.push(centered('LEMBAGA PEMERIKSA HALAL UNIVERSITAS JEMBER'));
  sections.push(...blank(1));
  sections.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 0, line: LINE }, children: [new TextRun({ text: `Dengan ini dilaporkan hasil pemeriksaan/auditing oleh Tim LPH UNEJ pada ${factory} yang beralamat di ${address}.`, font: FONT, size: FONT_SIZE })] }));
  sections.push(...blank(1));
  sections.push(valueTable([
    ['Nama Pabrik', factory],
    ['Alamat Pabrik', address],
    ['Tanggal Audit', dateText(application.auditDate)],
    ['STTD', text(application.sttd)],
    ['Nomor Audit', text(application.auditNumber)],
    ['Auditor', auditorNames(application)],
    ['Nama Pejabat\nPerusahaan', officialNames(application)],
  ]));
  sections.push(...blank(3));
  sections.push(boxed(`STATUS PENDAFTARAN: ${text(application.registrationType || 'SERTIFIKASI BARU')}`));
  sections.push(...blank(2));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0, line: LINE }, children: [new TextRun({ text: `Jember, ${dateText(application.auditDate)}`, font: FONT, size: FONT_SIZE })] }));
  sections.push(centered('Pimpinan LPH'));
  sections.push(...blank(3));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0, line: LINE }, children: [new TextRun({ text: `(${text(application.leadLphName || '................................')})`, font: FONT, size: FONT_SIZE })] }));

  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(sectionTitle(`Kelompok Produk\t\t: ${text(application.productGroup)}`));
  sections.push(...blank(1));
  sections.push(sectionTitle('Daftar Produk:'));
  sections.push(borderedTable(['No.', 'Nama Produk', 'Jenis Produk'], (application.products || []).map((item: any, index: number) => [String(index + 1), text(item.name), text(item.type)]), [650, 4450, 4260]));
  sections.push(...blank(1));
  sections.push(sectionTitle('DAFTAR BAHAN :'));
  sections.push(borderedTable(['No.', 'Bahan', 'Diragukan', 'Temuan', 'Keterangan'], (application.ingredients || []).map((item: any, index: number) => [String(index + 1), text(item.name), item.hasSH ? 'V' : '-', item.hasSH ? `SH BPJPH NO. ${text(item.shNumber)}` : '-', text(item.notes || item.producer || item.supplier || ingredientDescription(item))]), [650, 2600, 1200, 2400, 2510]));

  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(centered('IMPLEMENTASI SJPH'));
  sections.push(...blank(1));
  sections.push(line(address));
  const sjphRows = categories.map((category: any) => {
    const categoryResponses = responses.filter((item: any) => item.criterion?.category?.code === category.code);
    const criteria = (category.criteria || []).map((criterion: any) => ({ ...criterion, response: responses.find((item: any) => item.criterionId === criterion.id) }));
    const actual = criteria.length ? criteria : categoryResponses.map((item: any) => ({ ...item.criterion, response: item }));
    const categoryTitle = text(category.name || category.code);
    const criteriaText = numbered(actual.map((item: any) => item.title));
    const auditText = actual.map((item: any, index: number) => { const result = results.find((audit: any) => audit.section === category.code && audit.criterion === item.title); const response = item.response; return `${index + 1}) ${resultLabels[result?.result || response?.auditorResult] || 'Belum diperiksa'}${result?.note || response?.auditorNotes ? ` — ${result?.note || response?.auditorNotes}` : ''}`; }).join('\n');
    const evidenceText = numbered(actual.map((item: any) => `${item.title}: ${evidence(item.response)}`));
    return [categoryTitle, criteriaText || 'Belum ada kriteria', auditText || 'Belum diperiksa', evidenceText || 'Belum diisi oleh penyelia'];
  });
  sections.push(borderedTable(['Kriteria', 'Hasil Audit', 'Bukti/keterangan'], sjphRows.map((row: string[]) => [row[0], `${row[1]}\n\n${row[2]}`, row[3]]), [2700, 3200, 3460]));

  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(sectionTitle('RINGKASAN HASIL PEMERIKSAAN DAN RENCANA TINDAK LANJUT'));
  sections.push(new Paragraph({ spacing: { before: 0, after: 0, line: LINE }, children: [new TextRun({ text: '(disampaikan saat closing meeting)', font: FONT, size: FONT_SIZE, italics: true })] }));
  const summary = application.auditSummary;
  const summaryItems = summary?.items || [];
  sections.push(summaryBox(summary?.summaryText || '', summary?.auditorHalal || ''));
  const findingRows = summaryItems.map((item: any, index: number) => [`${index + 1}. ${text(item.finding)}`, text(item.correction)]);
  sections.push(borderedTable(['Temuan', 'Perbaikan'], findingRows.length ? findingRows : [['Belum ada temuan.', '-']], [4680, 4680]));
  const signatureRows = [[
    `Jember, ${dateText(application.auditDate)}\n\nLead Auditor,\n\n\n\n${text(application.auditSummary?.auditorHalal || auditorNames(application))}`,
    `Auditee,\n\n\n\n${officialNames(application)}`,
  ]];
  sections.push(borderedTable(['', ''], signatureRows, [4680, 4680]));

  return new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: sections }] });
}
