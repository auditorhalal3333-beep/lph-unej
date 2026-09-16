import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pengajuans = await prisma.pengajuan.findMany({ include: { user: true } });
  return NextResponse.json(pengajuans);
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const pengajuan = await prisma.pengajuan.create({
    data: {
      userId: session.user.id,
      type: body.type,
      companyName: body.companyName,
      factoryName: body.factoryName,
      ownerName: body.ownerName,
      address: body.address,
      nib: body.nib,
      sttd: body.sttd,
      supervisor: body.supervisor,
      contact: body.contact,
    },
  });
  return NextResponse.json(pengajuan);
}
