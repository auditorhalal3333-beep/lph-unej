import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const finding = await prisma.temuan.findUnique({ where: { id } });
  if (!finding || !(await canAccessApplication(user.id, user.role, finding.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  if (!body.evidenceUrl || typeof body.evidenceUrl !== 'string') return NextResponse.json({ error: 'Tautan bukti perbaikan wajib diisi.' }, { status: 400 });
  const fix = await prisma.temuanFix.create({ data: { temuanId: id, evidenceUrl: body.evidenceUrl, notes: body.notes, status: 'SUBMITTED' } });
  await prisma.temuan.update({ where: { id }, data: { status: 'SUBMITTED', response: body.notes, responseAt: new Date() } });
  await prisma.auditLog.create({ data: { pengajuanId: finding.pengajuanId, actorId: user.id, action: 'CORRECTIVE_ACTION_SUBMITTED', description: `Perbaikan temuan #${finding.number} dikirim.` } });
  return NextResponse.json(fix);
}
