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
  const parsed = applicationSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 });
  const data = parsed.data;
  const auditNumber = `LPH-${new Date().getFullYear()}-${String(await prisma.pengajuan.count() + 1).padStart(4, '0')}`;
  const pengajuan = await prisma.pengajuan.create({ data: { ...data, userId: user.id, auditNumber } });
  await prisma.auditLog.create({ data: { pengajuanId: pengajuan.id, actorId: user.id, action: 'APPLICATION_CREATED', description: 'Pengajuan baru dibuat.' } });
  return NextResponse.json(pengajuan);
}
