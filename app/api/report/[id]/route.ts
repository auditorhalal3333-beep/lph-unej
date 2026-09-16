import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pengajuan = await prisma.pengajuan.findUnique({
    where: { id },
    include: { products: true, ingredients: true, sjphSections: { include: { items: true } }, temuan: { include: { fixes: true } } },
  });
  if (!pengajuan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ children: [new TextRun({ text: 'Laporan Audit Halal', bold: true, size: 28 })] }),
          new Paragraph(`Perusahaan: ${pengajuan.companyName}`),
          new Paragraph(`Pabrik: ${pengajuan.factoryName}`),
          new Paragraph(`Pemilik: ${pengajuan.ownerName}`),
          new Paragraph(`Alamat: ${pengajuan.address}`),
          new Paragraph(`NIB: ${pengajuan.nib ?? '-'}`),
          new Paragraph(`STTD: ${pengajuan.sttd ?? '-'}`),
          new Paragraph(`Penyelia: ${pengajuan.supervisor ?? '-'}`),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return new NextResponse(Buffer.from(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename=laporan.docx',
    },
  });
}
