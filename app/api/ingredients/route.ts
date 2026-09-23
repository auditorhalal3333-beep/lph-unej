import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';
import { ingredientSchema } from '@/lib/validation';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('pengajuanId');
  if (!id || !(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await prisma.ingredient.findMany({ where: { pengajuanId: id }, include: { products: { include: { product: true } } }, orderBy: { createdAt: 'asc' } }));
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['ADMIN', 'SUPER_ADMIN', 'AUDITOR'].includes(user.role)) return NextResponse.json({ error: 'Hanya auditor yang dapat mengisi keterangan pemeriksaan.' }, { status: 403 });
  const body = await req.json();
  if (!body.pengajuanId || !body.notes || typeof body.notes !== 'object') return NextResponse.json({ error: 'Data keterangan tidak valid.' }, { status: 400 });
  if (!(await canAccessApplication(user.id, user.role, body.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const ingredients = await prisma.ingredient.findMany({ where: { pengajuanId: body.pengajuanId }, select: { id: true, name: true } });
  const allowed = new Map(ingredients.map((item) => [item.id, item.name]));
  const updates = Object.entries(body.notes as Record<string, unknown>)
    .filter(([ingredientId, notes]) => allowed.has(ingredientId) && typeof notes === 'string')
    .map(([ingredientId, notes]) => ({ ingredientId, notes: (notes as string).trim() || null }));
  await prisma.$transaction(async (tx) => {
    for (const item of updates) {
      await tx.ingredient.update({ where: { id: item.ingredientId }, data: { notes: item.notes } });
    }
    await tx.auditLog.create({ data: { pengajuanId: body.pengajuanId, actorId: user.id, action: 'INGREDIENT_AUDITOR_NOTES_UPDATED', description: `${updates.length} keterangan bahan diperbarui.` } });
  });
  return NextResponse.json({ saved: updates.length });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = ingredientSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Data bahan belum lengkap.' }, { status: 400 });
  if (!(await canAccessApplication(user.id, user.role, parsed.data.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (parsed.data.hasSH && !parsed.data.shNumber) return NextResponse.json({ error: 'Nomor SH wajib diisi jika bahan memiliki SH.' }, { status: 400 });
  const { shDate, ...data } = parsed.data;
  const ingredient = await prisma.ingredient.create({ data: { ...data, shDate: shDate ? new Date(shDate) : null } });
  await prisma.auditLog.create({ data: { pengajuanId: ingredient.pengajuanId, actorId: user.id, action: 'INGREDIENT_CREATED', description: `Bahan ${ingredient.name} ditambahkan.` } });
  return NextResponse.json(ingredient);
}
