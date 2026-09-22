import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canAccessApplication, getCurrentUser } from '@/lib/auth';

async function access(req: Request, pengajuanId: string) {
  const user = await getCurrentUser();
  if (!user) return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!(await canAccessApplication(user.id, user.role, pengajuanId))) {
    return { user: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user, response: null };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pengajuanId: string }> },
) {
  const { pengajuanId } = await params;
  const result = await access(req, pengajuanId);
  if (result.response) return result.response;
  const summary = await prisma.auditSummary.findUnique({
    where: { pengajuanId },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
  return NextResponse.json(summary || { auditorHalal: '', summaryText: '', items: [] });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ pengajuanId: string }> },
) {
  const { pengajuanId } = await params;
  const result = await access(req, pengajuanId);
  if (result.response) return result.response;
  const user = result.user!;
  if (!['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Hanya tim audit yang dapat mengubah ringkasan.' }, { status: 403 });
  }

  const body = await req.json();
  const auditorHalal = typeof body.auditorHalal === 'string' ? body.auditorHalal.trim() : '';
  const summaryText = typeof body.summaryText === 'string' ? body.summaryText.trim() : '';
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems
    .map((item: unknown) => {
      const value = item as { finding?: unknown; correction?: unknown };
      return {
        finding: typeof value.finding === 'string' ? value.finding.trim() : '',
        correction: typeof value.correction === 'string' ? value.correction.trim() : '',
      };
    })
    .filter((item: { finding: string; correction: string }) => item.finding || item.correction)
    .map((item: { finding: string; correction: string }, sortOrder: number) => ({ ...item, sortOrder }));

  const summary = await prisma.$transaction(async (tx) => {
    const saved = await tx.auditSummary.upsert({
      where: { pengajuanId },
      update: { auditorHalal, summaryText, items: { deleteMany: {}, create: items } },
      create: { pengajuanId, auditorHalal, summaryText, items: { create: items } },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    await tx.auditLog.create({
      data: {
        pengajuanId,
        actorId: user.id,
        action: 'AUDIT_SUMMARY_UPDATED',
        description: `Ringkasan audit diperbarui (${items.length} baris).`,
      },
    });
    return saved;
  });

  return NextResponse.json(summary);
}
