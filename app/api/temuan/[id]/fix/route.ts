import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'PENYELIA') return NextResponse.json({ error: 'Hanya penyelia yang dapat mengirim perbaikan.' }, { status: 403 });

  const { id } = await params;
  const finding = await prisma.temuan.findUnique({
    where: { id },
    include: { pengajuan: true },
  });
  if (!finding || !(await canAccessApplication(user.id, user.role, finding.pengajuanId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!['OPEN', 'REJECTED'].includes(finding.status)) {
    return NextResponse.json({ error: 'Temuan ini belum dapat dikirimkan kembali.' }, { status: 400 });
  }

  const body = await req.json();
  if (!body.evidenceUrl || typeof body.evidenceUrl !== 'string' || !body.evidenceUrl.trim().match(/^https?:\/\//i)) {
    return NextResponse.json({ error: 'Tautan bukti perbaikan yang valid wajib diisi.' }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const fix = await tx.temuanFix.create({
      data: { temuanId: id, evidenceUrl: body.evidenceUrl.trim(), notes: body.notes?.trim() || null, status: 'SUBMITTED' },
    });
    await tx.temuan.update({
      where: { id },
      data: { status: 'SUBMITTED', response: body.notes?.trim() || null, responseAt: new Date() },
    });

    if (finding.pengajuan.status === 'PERLU_PERBAIKAN') {
      await tx.pengajuan.update({ where: { id: finding.pengajuanId }, data: { status: 'MENUNGGU_VERIFIKASI' } });
      await tx.auditLog.create({
        data: {
          pengajuanId: finding.pengajuanId,
          actorId: user.id,
          action: 'STATUS_CHANGED',
          description: 'PERLU_PERBAIKAN → MENUNGGU_VERIFIKASI. Perbaikan dikirim untuk diverifikasi auditor.',
        },
      });
    }
    await tx.auditLog.create({
      data: {
        pengajuanId: finding.pengajuanId,
        actorId: user.id,
        action: 'CORRECTIVE_ACTION_SUBMITTED',
        description: `Perbaikan temuan #${finding.number} dikirim.`,
      },
    });
    const assignments = await tx.auditAssignment.findMany({ where: { pengajuanId: finding.pengajuanId } });
    for (const assignment of assignments) {
      await tx.notification.create({
        data: {
          userId: assignment.auditorId,
          pengajuanId: finding.pengajuanId,
          title: 'Perbaikan menunggu verifikasi',
          message: `Bukti perbaikan temuan #${finding.number} telah dikirim oleh penyelia.`,
        },
      });
    }
    return fix;
  });

  return NextResponse.json(result);
}
