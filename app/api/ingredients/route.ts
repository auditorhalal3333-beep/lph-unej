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
