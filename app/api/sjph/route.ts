import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const section = await prisma.sjphSection.create({
    data: {
      pengajuanId: body.pengajuanId,
      sectionType: body.sectionType,
      title: body.title,
      items: {
        create: body.items,
      },
    },
  });
  return NextResponse.json(section);
}
