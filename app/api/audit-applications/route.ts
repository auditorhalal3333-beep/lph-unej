import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const where = user.role === 'AUDITOR' ? { assignments: { some: { auditorId: user.id } } } : {};
  const applications = await prisma.pengajuan.findMany({ where, include: { user: true, assignments: { include: { auditor: true } }, _count: { select: { products: true, ingredients: true, temuan: true } } }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json(applications);
}
