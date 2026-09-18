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
  if (!body.pengajuanId || !(await canAccessApplication(user.id, user.role, body.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const responses = Array.isArray(body.responses) ? body.responses : body.criterionId ? [{ criterionId: body.criterionId, providerStatus: body.providerStatus, providerNotes: body.providerNotes }] : [];
  if (!responses.length || responses.some((item: { criterionId?: string }) => !item.criterionId)) return NextResponse.json({ error: 'Respons SJPH tidak valid' }, { status: 400 });
  await prisma.$transaction(async tx => {
    for (const item of responses) {
      await tx.sjphResponse.upsert({ where: { pengajuanId_criterionId: { pengajuanId: body.pengajuanId, criterionId: item.criterionId } }, update: { providerStatus: item.providerStatus ?? 'BELUM_DIISI', providerNotes: item.providerNotes ?? null }, create: { pengajuanId: body.pengajuanId, criterionId: item.criterionId, providerStatus: item.providerStatus ?? 'BELUM_DIISI', providerNotes: item.providerNotes ?? null } });
    }
    await tx.auditLog.create({ data: { pengajuanId: body.pengajuanId, actorId: user.id, action: 'SJPH_RESPONSE_UPDATED', description: `${responses.length} respons Implementasi SJPH diperbarui.` } });
  });
  return NextResponse.json({ saved: responses.length });
}
