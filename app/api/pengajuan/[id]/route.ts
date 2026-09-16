import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const pengajuan = await prisma.pengajuan.findUnique({
    where: { id },
    include: { products: true, ingredients: true, sjphSections: { include: { items: true } }, temuan: { include: { fixes: true } } },
  });
  if (!pengajuan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(pengajuan);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const pengajuan = await prisma.pengajuan.update({
    where: { id },
    data: { status: body.status },
  });
  return NextResponse.json(pengajuan);
}
