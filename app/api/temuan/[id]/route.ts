import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const finding = await prisma.temuan.findUnique({ where: { id } });
  if (!finding || !(await canAccessApplication(user.id, user.role, finding.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  if (!['VERIFIED', 'REJECTED', 'CLOSED'].includes(body.status)) return NextResponse.json({ error: 'Status verifikasi tidak valid.' }, { status: 400 });
  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.temuan.update({ where: { id }, data: { status: body.status } });
    await tx.findingVerification.create({ data: { findingId: id, auditorId: user.id, result: body.status, note: body.note } });
    await tx.auditLog.create({ data: { pengajuanId: finding.pengajuanId, actorId: user.id, action: 'FINDING_VERIFIED', description: `Temuan #${finding.number} diverifikasi: ${body.status}.` } });
    return item;
  });
  return NextResponse.json(updated);
}
