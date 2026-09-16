import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('pengajuanId');
  if (!id || !(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await prisma.sjphResponse.findMany({ where: { pengajuanId: id }, include: { criterion: { include: { category: true } }, evidences: true } }));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!body.pengajuanId || !body.criterionId || !(await canAccessApplication(user.id, user.role, body.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const response = await prisma.sjphResponse.upsert({ where: { pengajuanId_criterionId: { pengajuanId: body.pengajuanId, criterionId: body.criterionId } }, update: { providerStatus: body.providerStatus ?? 'SUDAH_DIISI', providerNotes: body.providerNotes }, create: { pengajuanId: body.pengajuanId, criterionId: body.criterionId, providerStatus: body.providerStatus ?? 'SUDAH_DIISI', providerNotes: body.providerNotes } });
  await prisma.auditLog.create({ data: { pengajuanId: body.pengajuanId, actorId: user.id, action: 'SJPH_RESPONSE_UPDATED', description: 'Respons Implementasi SJPH diperbarui.' } });
  return NextResponse.json(response);
}
