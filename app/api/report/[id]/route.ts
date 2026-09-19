import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildAuditReport } from '@/lib/report';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const pengajuan = await prisma.pengajuan.findUnique({ where: { id }, include: { officials: { orderBy: { sortOrder: 'asc' } }, products: true, ingredients: true, assignments: { include: { auditor: { select: { name: true } } } }, auditResults: true, sjphResponses: { include: { criterion: { include: { category: true } }, evidences: true } }, temuan: { include: { fixes: true, verifications: true } } } });
  if (!pengajuan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (user.role === 'PENYELIA' && pengajuan.status !== 'SELESAI') return NextResponse.json({ error: 'Laporan akhir tersedia setelah audit selesai.' }, { status: 403 });
  const categories = await prisma.sjphCategory.findMany({ where: { active: true }, include: { criteria: { where: { active: true }, orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } });
  const doc = buildAuditReport({ ...pengajuan, sjphCategories: categories });
  const buffer = await (await import('docx')).Packer.toBuffer(doc);
  const version = await prisma.report.count({ where: { pengajuanId: id } }) + 1;
  await prisma.report.create({ data: { pengajuanId: id, version, fileName: `${pengajuan.auditNumber}-laporan.docx`, format: 'DOCX' } });
  return new NextResponse(Buffer.from(buffer), { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename="${pengajuan.auditNumber}-laporan.docx"` } });
}
