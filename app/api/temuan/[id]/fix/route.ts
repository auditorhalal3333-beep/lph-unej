import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const fix = await prisma.temuanFix.create({
    data: {
      temuanId: id,
      evidenceUrl: body.evidenceUrl,
      notes: body.notes,
    },
  });
  await prisma.temuan.update({
    where: { id },
    data: { status: 'VERIFIKASI' },
  });
  return NextResponse.json(fix);
}
