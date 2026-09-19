import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applicationSchema } from '@/lib/validation';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const where = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? {} : user.role === 'AUDITOR' ? { assignments: { some: { auditorId: user.id } } } : { userId: user.id };
  const pengajuans = await prisma.pengajuan.findMany({ where, include: { user: true, _count: { select: { products: true, ingredients: true, temuan: true } } }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json(pengajuans);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 });
  const data = parsed.data;
  const officials = Array.isArray(body.officials) ? body.officials.filter((item: any) => item?.name?.trim()).map((item: any, index: number) => ({ name: item.name.trim(), title: item.title?.trim() || null, sortOrder: index })) : [];
  if (!officials.length) return NextResponse.json({ error: 'Minimal satu pejabat perusahaan wajib diisi.' }, { status: 400 });
  const auditNumber = `LPH-${new Date().getFullYear()}-${String(await prisma.pengajuan.count() + 1).padStart(4, '0')}`;
  const pengajuan = await prisma.$transaction(async tx => {
    const created = await tx.pengajuan.create({ data: { ...data, companyOfficialName: officials[0].name, userId: user.id, auditNumber } });
    await tx.pengajuanOfficial.createMany({ data: officials.map((item: any) => ({ ...item, pengajuanId: created.id })) });
    await tx.auditLog.create({ data: { pengajuanId: created.id, actorId: user.id, action: 'APPLICATION_CREATED', description: 'Pengajuan baru dibuat.' } });
    return created;
  });
  return NextResponse.json(pengajuan);
}
