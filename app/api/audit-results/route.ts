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
  if (!body.pengajuanId || !body.section) return NextResponse.json({ error: 'Hasil audit belum lengkap.' }, { status: 400 });
  if (!(await canAccessApplication(user.id, user.role, body.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const results = Array.isArray(body.results) ? body.results : body.criterion ? [{ criterion: body.criterion, result: body.result, note: body.note }] : [];
  const allowed = ['SESUAI', 'TIDAK_SESUAI', 'PERLU_PERBAIKAN', 'TIDAK_BERLAKU'];
  if (!results.length || results.some((item: { criterion?: string; result?: string }) => !item.criterion || !allowed.includes(item.result ?? ''))) return NextResponse.json({ error: 'Hasil audit belum lengkap.' }, { status: 400 });
  if (results.some((item: { result: string; note?: string }) => item.result !== 'SESUAI' && item.result !== 'TIDAK_BERLAKU' && !item.note?.trim())) return NextResponse.json({ error: 'Catatan wajib diisi untuk hasil yang tidak sesuai.' }, { status: 400 });
  await prisma.$transaction(async tx => {
    for (const item of results) {
      await tx.auditResult.upsert({
        where: { pengajuanId_section_criterion: { pengajuanId: body.pengajuanId, section: body.section, criterion: item.criterion } },
        update: { result: item.result, note: item.note?.trim() || null, auditorId: user.id },
        create: { pengajuanId: body.pengajuanId, section: body.section, criterion: item.criterion, result: item.result, note: item.note?.trim() || null, auditorId: user.id },
      });
    }
    await tx.auditLog.create({ data: { pengajuanId: body.pengajuanId, actorId: user.id, action: 'AUDIT_RESULT_UPDATED', description: `Hasil audit ${body.section} (${results.length} kriteria) diperbarui.` } });
  });
  if (results.some((item: { result: string }) => item.result === 'PERLU_PERBAIKAN' || item.result === 'TIDAK_SESUAI')) await prisma.pengajuan.update({ where: { id: body.pengajuanId }, data: { status: 'PERLU_PERBAIKAN' } });
  return NextResponse.json({ saved: results.length });
}
