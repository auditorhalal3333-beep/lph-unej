import { NextResponse } from 'next/server';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('pengajuanId');
  if (!id || !(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await prisma.sjphCategory.findMany({ where: { active: true }, include: { criteria: { where: { active: true }, orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }));
}
