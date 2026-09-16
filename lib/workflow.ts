import { prisma } from './prisma';

export const transitions: Record<string, string[]> = {
  DRAFT: ['DIAJUKAN'],
  DIAJUKAN: ['MENUNGGU_REVIEW'],
  MENUNGGU_REVIEW: ['MENUNGGU_AUDITOR', 'PERLU_PERBAIKAN'],
  MENUNGGU_AUDITOR: ['SEDANG_DIAUDIT'],
  SEDANG_DIAUDIT: ['PERLU_PERBAIKAN', 'MENUNGGU_VERIFIKASI', 'SELESAI'],
  PERLU_PERBAIKAN: ['MENUNGGU_VERIFIKASI', 'SEDANG_DIAUDIT'],
  MENUNGGU_VERIFIKASI: ['SEDANG_DIAUDIT', 'SELESAI', 'PERLU_PERBAIKAN'],
  SELESAI: [],
};

export async function changeApplicationStatus(applicationId: string, nextStatus: string, actorId: string, description: string) {
  return prisma.$transaction(async (tx) => {
    const application = await tx.pengajuan.findUnique({ where: { id: applicationId }, include: { user: true, temuan: true } });
    if (!application) throw new Error('NOT_FOUND');
    const allowed = transitions[application.status] ?? [];
    if (!allowed.includes(nextStatus)) throw new Error('INVALID_TRANSITION');
    if (nextStatus === 'SELESAI' && application.temuan.some((finding) => !['VERIFIED', 'CLOSED'].includes(finding.status))) throw new Error('OPEN_FINDINGS');
    if (nextStatus === 'SELESAI') {
      const assignment = await tx.auditAssignment.findFirst({ where: { pengajuanId: applicationId } });
      if (!assignment?.auditorName?.trim()) throw new Error('AUDITOR_IDENTITY_REQUIRED');
    }
    const updated = await tx.pengajuan.update({ where: { id: applicationId }, data: { status: nextStatus, ...(nextStatus === 'SEDANG_DIAUDIT' ? { auditDate: new Date() } : {}) } });
    await tx.auditLog.create({ data: { pengajuanId: applicationId, actorId, action: 'STATUS_CHANGED', description: `${application.status} → ${nextStatus}. ${description}` } });
    if (nextStatus === 'PERLU_PERBAIKAN') await tx.notification.create({ data: { userId: application.userId, pengajuanId: applicationId, title: 'Perbaikan diperlukan', message: description || 'Auditor meminta Anda memeriksa temuan pada pengajuan.' } });
    if (nextStatus === 'SELESAI') await tx.notification.create({ data: { userId: application.userId, pengajuanId: applicationId, title: 'Audit selesai', message: 'Audit telah selesai dan laporan dapat diunduh.' } });
    return updated;
  });
}

export async function writeAuditLog(pengajuanId: string, actorId: string, action: string, description: string, metadata?: string) {
  return prisma.auditLog.create({ data: { pengajuanId, actorId, action, description, metadata } });
}
