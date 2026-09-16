import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      pengajuanId: body.pengajuanId,
      name: body.name,
      type: body.type,
    },
  });
  return NextResponse.json(product);
}
