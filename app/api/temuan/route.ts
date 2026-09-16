import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findingSchema } from '@/lib/validation';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('pengajuanId');
  if (!id || !(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await prisma.temuan.findMany({ where: { pengajuanId: id }, include: { fixes: true, verifications: true }, orderBy: { number: 'asc' } }));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = findingSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Temuan belum lengkap.' }, { status: 400 });
  if (!(await canAccessApplication(user.id, user.role, parsed.data.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const currentCount = await prisma.temuan.count({ where: { pengajuanId: parsed.data.pengajuanId } });
  const finding = await prisma.temuan.create({ data: { pengajuanId: parsed.data.pengajuanId, section: parsed.data.section, criterion: parsed.data.criterion, category: parsed.data.category, description: parsed.data.description, instruction: parsed.data.instruction, number: currentCount + 1, auditorId: user.id } });
  await prisma.pengajuan.update({ where: { id: finding.pengajuanId }, data: { status: 'PERLU_PERBAIKAN' } });
  await prisma.auditLog.create({ data: { pengajuanId: finding.pengajuanId, actorId: user.id, action: 'FINDING_CREATED', description: `Temuan #${finding.number} dibuat.` } });
  return NextResponse.json(finding);
}
