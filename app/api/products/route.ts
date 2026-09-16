import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';
import { productSchema } from '@/lib/validation';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = productSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Data produk belum lengkap.' }, { status: 400 });
  if (!(await canAccessApplication(user.id, user.role, parsed.data.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const product = await prisma.product.create({ data: parsed.data });
  await prisma.auditLog.create({ data: { pengajuanId: product.pengajuanId, actorId: user.id, action: 'PRODUCT_CREATED', description: `Produk ${product.name} ditambahkan.` } });
  return NextResponse.json(product);
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('pengajuanId');
  if (!id || !(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await prisma.product.findMany({ where: { pengajuanId: id }, include: { materials: { include: { ingredient: true } } } }));
}
