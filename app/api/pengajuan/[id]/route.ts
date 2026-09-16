import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';
import { applicationSchema } from '@/lib/validation';
import { changeApplicationStatus, writeAuditLog } from '@/lib/workflow';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const pengajuan = await prisma.pengajuan.findUnique({ where: { id }, include: { products: { include: { materials: { include: { ingredient: true } } } }, ingredients: true, sjphSections: { include: { items: true } }, sjphResponses: { include: { criterion: { include: { category: true } }, evidences: true } }, temuan: { include: { fixes: true, verifications: true } }, evidences: true, auditResults: true, assignments: { include: { auditor: true } }, auditLogs: { include: { actor: true }, orderBy: { createdAt: 'desc' } } } });
  if (!pengajuan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(pengajuan);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = applicationSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 });
  const updated = await prisma.pengajuan.update({ where: { id }, data: parsed.data });
  await writeAuditLog(id, user.id, 'APPLICATION_UPDATED', 'Data pengajuan diperbarui.');
  return NextResponse.json(updated);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  try { const updated = await changeApplicationStatus(id, body.status, user.id, body.description ?? ''); return NextResponse.json(updated); } catch (error) { const message = error instanceof Error && error.message === 'INVALID_TRANSITION' ? 'Perubahan status tidak diizinkan.' : 'Permintaan tidak dapat diproses.'; return NextResponse.json({ error: message }, { status: 400 }); }
}
