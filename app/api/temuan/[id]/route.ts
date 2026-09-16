import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';
import { changeApplicationStatus } from '@/lib/workflow';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const finding = await prisma.temuan.findUnique({ where: { id }, include: { pengajuan: true } });
  if (!finding || !(await canAccessApplication(user.id, user.role, finding.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  if (!['VERIFIED', 'REJECTED', 'CLOSED'].includes(body.status)) return NextResponse.json({ error: 'Status verifikasi tidak valid.' }, { status: 400 });
  if (body.status === 'REJECTED' && !body.note?.trim()) return NextResponse.json({ error: 'Catatan wajib diisi saat bukti ditolak.' }, { status: 400 });

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.temuan.update({ where: { id }, data: { status: body.status } });
      await tx.temuanFix.updateMany({ where: { temuanId: id, status: 'SUBMITTED' }, data: { status: body.status } });
      await tx.findingVerification.create({ data: { findingId: id, auditorId: user.id, result: body.status, note: body.note?.trim() || null } });
      await tx.auditLog.create({ data: { pengajuanId: finding.pengajuanId, actorId: user.id, action: 'FINDING_VERIFIED', description: `Temuan #${finding.number} diverifikasi: ${body.status}.` } });
      await tx.notification.create({
        data: {
          userId: finding.pengajuan.userId,
          pengajuanId: finding.pengajuanId,
          title: body.status === 'REJECTED' ? 'Perbaikan perlu dikirim ulang' : 'Perbaikan diterima',
          message: body.status === 'REJECTED' ? `Bukti temuan #${finding.number} belum sesuai. ${body.note.trim()}` : `Bukti perbaikan temuan #${finding.number} telah diterima auditor.`,
        },
      });
      return item;
    });

    if (body.status === 'REJECTED') {
      if (finding.pengajuan.status !== 'PERLU_PERBAIKAN') {
        await changeApplicationStatus(finding.pengajuanId, 'PERLU_PERBAIKAN', user.id, `Temuan #${finding.number} perlu diperbaiki kembali.`);
      }
    } else {
      const remaining = await prisma.temuan.count({ where: { pengajuanId: finding.pengajuanId, status: { notIn: ['VERIFIED', 'CLOSED'] } } });
      if (remaining === 0 && ['MENUNGGU_VERIFIKASI', 'PERLU_PERBAIKAN', 'SEDANG_DIAUDIT'].includes(finding.pengajuan.status)) {
        await changeApplicationStatus(finding.pengajuanId, 'SELESAI', user.id, 'Seluruh temuan telah diverifikasi.');
      }
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_TRANSITION') return NextResponse.json({ error: 'Status pengajuan tidak dapat berpindah pada tahap ini.' }, { status: 400 });
    return NextResponse.json({ error: 'Verifikasi gagal diproses.' }, { status: 500 });
  }
}
