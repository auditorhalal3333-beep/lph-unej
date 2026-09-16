import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { changeApplicationStatus } from '@/lib/workflow';

const adminRoles = ['ADMIN', 'SUPER_ADMIN'];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !adminRoles.includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  if (!body.pengajuanId || !body.auditorId) return NextResponse.json({ error: 'Pengajuan dan auditor wajib dipilih.' }, { status: 400 });

  const [application, auditor] = await Promise.all([
    prisma.pengajuan.findUnique({ where: { id: body.pengajuanId } }),
    prisma.user.findFirst({ where: { id: body.auditorId, role: { in: ['AUDITOR', 'ADMIN'] } } }),
  ]);
  if (!application) return NextResponse.json({ error: 'Pengajuan tidak ditemukan.' }, { status: 404 });
  if (!auditor) return NextResponse.json({ error: 'Auditor tidak ditemukan.' }, { status: 404 });

  try {
    const assignment = await prisma.$transaction(async (tx) => {
      const item = await tx.auditAssignment.upsert({
        where: { pengajuanId_auditorId: { pengajuanId: body.pengajuanId, auditorId: body.auditorId } },
        update: { notes: body.notes?.trim() || null },
        create: { pengajuanId: body.pengajuanId, auditorId: body.auditorId, notes: body.notes?.trim() || null },
      });
      await tx.auditLog.create({ data: { pengajuanId: body.pengajuanId, actorId: user.id, action: 'AUDITOR_ASSIGNED', description: `Auditor ${auditor.name} ditugaskan.` } });
      await tx.notification.create({ data: { userId: auditor.id, pengajuanId: body.pengajuanId, title: 'Audit baru ditugaskan', message: `Anda ditugaskan untuk memeriksa ${application.companyName}.` } });
      return item;
    });

    if (application.status === 'MENUNGGU_REVIEW') {
      await changeApplicationStatus(body.pengajuanId, 'MENUNGGU_AUDITOR', user.id, `Auditor ${auditor.name} ditetapkan.`);
    }
    return NextResponse.json(assignment);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_TRANSITION') return NextResponse.json({ error: 'Pengajuan belum berada pada tahap review.' }, { status: 400 });
    return NextResponse.json({ error: 'Assignment gagal disimpan.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  if (!body.assignmentId || !body.auditorName?.trim()) return NextResponse.json({ error: 'Nama auditor wajib diisi.' }, { status: 400 });
  if (body.auditorName.trim().length > 120 || (body.auditorTitle && body.auditorTitle.trim().length > 120)) return NextResponse.json({ error: 'Nama atau gelar auditor terlalu panjang.' }, { status: 400 });
  const assignment = await prisma.auditAssignment.findUnique({ where: { id: body.assignmentId }, include: { pengajuan: true } });
  if (!assignment) return NextResponse.json({ error: 'Assignment tidak ditemukan.' }, { status: 404 });
  if (user.role === 'AUDITOR' && assignment.auditorId !== user.id) return NextResponse.json({ error: 'Anda tidak memiliki assignment ini.' }, { status: 403 });
  const updated = await prisma.auditAssignment.update({ where: { id: assignment.id }, data: { auditorName: body.auditorName.trim(), auditorTitle: body.auditorTitle?.trim() || null } });
  await prisma.auditLog.create({ data: { pengajuanId: assignment.pengajuanId, actorId: user.id, action: 'AUDITOR_IDENTITY_UPDATED', description: `Identitas auditor diperbarui: ${updated.auditorName}${updated.auditorTitle ? `, ${updated.auditorTitle}` : ''}.` } });
  return NextResponse.json(updated);
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !adminRoles.includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const pengajuanId = new URL(req.url).searchParams.get('pengajuanId');
  const auditors = await prisma.user.findMany({ where: { role: { in: ['AUDITOR', 'ADMIN'] } }, select: { id: true, name: true, email: true, role: true }, orderBy: { name: 'asc' } });
  if (!pengajuanId) return NextResponse.json(auditors);
  const assignments = await prisma.auditAssignment.findMany({ where: { pengajuanId }, include: { auditor: { select: { id: true, name: true, email: true, role: true } } }, orderBy: { assignedAt: 'desc' } });
  return NextResponse.json({ auditors, assignments });
}
