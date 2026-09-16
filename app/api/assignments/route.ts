import { NextResponse } from 'next/server';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  if (!body.pengajuanId || !body.auditorId) return NextResponse.json({ error: 'Pengajuan dan auditor wajib dipilih.' }, { status: 400 });
  const auditor = await prisma.user.findFirst({ where: { id: body.auditorId, role: { in: ['AUDITOR', 'ADMIN'] } } });
  if (!auditor) return NextResponse.json({ error: 'Auditor tidak ditemukan.' }, { status: 404 });
  const assignment = await prisma.auditAssignment.upsert({ where: { pengajuanId_auditorId: { pengajuanId: body.pengajuanId, auditorId: body.auditorId } }, update: { notes: body.notes }, create: { pengajuanId: body.pengajuanId, auditorId: body.auditorId, notes: body.notes } });
  await prisma.pengajuan.update({ where: { id: body.pengajuanId }, data: { status: 'MENUNGGU_AUDITOR' } });
  await prisma.auditLog.create({ data: { pengajuanId: body.pengajuanId, actorId: user.id, action: 'AUDITOR_ASSIGNED', description: `Auditor ${auditor.name} ditugaskan.` } });
  await prisma.notification.create({ data: { userId: auditor.id, pengajuanId: body.pengajuanId, title: 'Audit baru ditugaskan', message: `Anda ditugaskan untuk memeriksa pengajuan ${body.pengajuanId}.` } });
  return NextResponse.json(assignment);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await prisma.user.findMany({ where: { role: { in: ['AUDITOR', 'ADMIN'] } }, select: { id: true, name: true, email: true, role: true } }));
}
