import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!body.pengajuanId || !(await canAccessApplication(user.id, user.role, body.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const result = await prisma.auditResult.upsert({ where: { pengajuanId_section_criterion: { pengajuanId: body.pengajuanId, section: body.section, criterion: body.criterion } }, update: { result: body.result, note: body.note, auditorId: user.id }, create: { pengajuanId: body.pengajuanId, section: body.section, criterion: body.criterion, result: body.result, note: body.note, auditorId: user.id } });
  await prisma.auditLog.create({ data: { pengajuanId: body.pengajuanId, actorId: user.id, action: 'AUDIT_RESULT_UPDATED', description: `${body.criterion}: ${body.result}.` } });
  return NextResponse.json(result);
}
