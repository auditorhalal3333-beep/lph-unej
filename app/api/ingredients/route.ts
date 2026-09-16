import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const ingredient = await prisma.ingredient.create({
    data: {
      pengajuanId: body.pengajuanId,
      name: body.name,
      brand: body.brand,
      producer: body.producer,
      supplier: body.supplier,
      hasSH: body.hasSH,
      shNumber: body.shNumber,
      shDate: body.shDate ? new Date(body.shDate) : null,
      notes: body.notes,
    },
  });
  return NextResponse.json(ingredient);
}
