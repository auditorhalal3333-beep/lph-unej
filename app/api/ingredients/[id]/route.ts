import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const ingredient = await prisma.ingredient.findUnique({ where: { id }, select: { id: true, pengajuanId: true } });
  if (!ingredient || !(await canAccessApplication(user.id, user.role, ingredient.pengajuanId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Hanya auditor yang dapat mengisi keterangan pemeriksaan.' }, { status: 403 });
  }
  const body = await req.json();
  if (typeof body.notes !== 'string') return NextResponse.json({ error: 'Keterangan tidak valid.' }, { status: 400 });
  const updated = await prisma.ingredient.update({ where: { id }, data: { notes: body.notes.trim() || null } });
  await prisma.auditLog.create({ data: { pengajuanId: ingredient.pengajuanId, actorId: user.id, action: 'INGREDIENT_AUDITOR_NOTE_UPDATED', description: `Keterangan auditor untuk bahan ${updated.name} diperbarui.` } });
  return NextResponse.json(updated);
}
