import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const temuan = await prisma.temuan.create({
    data: {
      pengajuanId: body.pengajuanId,
      section: body.section,
      description: body.description,
    },
  });
  return NextResponse.json(temuan);
}
