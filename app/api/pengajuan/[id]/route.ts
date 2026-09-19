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
  const pengajuan = await prisma.pengajuan.findUnique({ where: { id }, include: { officials: { orderBy: { sortOrder: 'asc' } }, products: { include: { materials: { include: { ingredient: true } } } }, ingredients: true, sjphSections: { include: { items: true } }, sjphResponses: { include: { criterion: { include: { category: true } }, evidences: true } }, temuan: { include: { fixes: true, verifications: true } }, evidences: true, auditResults: true, assignments: { include: { auditor: true } }, auditLogs: { include: { actor: true }, orderBy: { createdAt: 'desc' } } } });
  if (!pengajuan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(pengajuan);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  if (Object.keys(body).some((key) => key === 'leadLphName') && !['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) return NextResponse.json({ error: 'Hanya tim audit yang dapat mengisi Ketua LPH.' }, { status: 403 });
  const parsed = applicationSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 });
  const officials = body.officials === undefined ? null : (Array.isArray(body.officials) ? body.officials.filter((item: any) => item?.name?.trim()).map((item: any, index: number) => ({ name: item.name.trim(), title: item.title?.trim() || null, sortOrder: index })) : []);
  if (officials && !officials.length) return NextResponse.json({ error: 'Minimal satu pejabat perusahaan wajib diisi.' }, { status: 400 });
  if (officials && user.role !== 'PENYELIA') return NextResponse.json({ error: 'Hanya Penyelia yang dapat mengubah pejabat perusahaan.' }, { status: 403 });
  const updated = await prisma.$transaction(async tx => {
    const result = await tx.pengajuan.update({ where: { id }, data: { ...parsed.data, ...(officials ? { companyOfficialName: officials[0].name } : {}) } });
    if (officials) { await tx.pengajuanOfficial.deleteMany({ where: { pengajuanId: id } }); await tx.pengajuanOfficial.createMany({ data: officials.map((item: any) => ({ ...item, pengajuanId: id })) }); }
    return result;
  });
  await writeAuditLog(id, user.id, 'APPLICATION_UPDATED', 'Data pengajuan diperbarui.');
  return NextResponse.json(updated);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const isOwnerSubmit = user.role === 'PENYELIA' && body.status === 'DIAJUKAN';
  if (!isAdmin && !isOwnerSubmit) return NextResponse.json({ error: 'Anda tidak dapat mengubah workflow pengajuan.' }, { status: 403 });
  try { const updated = await changeApplicationStatus(id, body.status, user.id, body.description ?? ''); return NextResponse.json(updated); } catch (error) { const message = error instanceof Error && error.message === 'INVALID_TRANSITION' ? 'Perubahan status tidak diizinkan.' : error instanceof Error && error.message === 'AUDITOR_IDENTITY_REQUIRED' ? 'Nama auditor wajib diisi sebelum audit diselesaikan.' : 'Permintaan tidak dapat diproses.'; return NextResponse.json({ error: message }, { status: 400 }); }
}
