import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('pengajuanId');
  if (!id || !(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await prisma.auditResult.findMany({ where: { pengajuanId: id }, orderBy: { section: 'asc' } }));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  if (!body.pengajuanId || !body.section || !body.criterion || !['SESUAI', 'TIDAK_SESUAI', 'PERLU_PERBAIKAN', 'TIDAK_BERLAKU'].includes(body.result)) return NextResponse.json({ error: 'Hasil audit belum lengkap.' }, { status: 400 });
  if (!(await canAccessApplication(user.id, user.role, body.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (body.result !== 'SESUAI' && body.result !== 'TIDAK_BERLAKU' && !body.note?.trim()) return NextResponse.json({ error: 'Catatan wajib diisi untuk hasil yang tidak sesuai.' }, { status: 400 });
  const result = await prisma.auditResult.upsert({ where: { pengajuanId_section_criterion: { pengajuanId: body.pengajuanId, section: body.section, criterion: body.criterion } }, update: { result: body.result, note: body.note, auditorId: user.id }, create: { pengajuanId: body.pengajuanId, section: body.section, criterion: body.criterion, result: body.result, note: body.note, auditorId: user.id } });
  await prisma.auditLog.create({ data: { pengajuanId: body.pengajuanId, actorId: user.id, action: 'AUDIT_RESULT_UPDATED', description: `${body.criterion}: ${body.result}.` } });
  if (body.result === 'PERLU_PERBAIKAN' || body.result === 'TIDAK_SESUAI') await prisma.pengajuan.update({ where: { id: body.pengajuanId }, data: { status: 'PERLU_PERBAIKAN' } });
  return NextResponse.json(result);
}
