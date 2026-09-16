import { NextResponse } from 'next/server';
import { getCurrentUser, canAccessApplication } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { evidenceSchema } from '@/lib/validation';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('pengajuanId');
  if (!id || !(await canAccessApplication(user.id, user.role, id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await prisma.evidence.findMany({ where: { pengajuanId: id }, include: { uploader: true }, orderBy: { createdAt: 'desc' } }));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = evidenceSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Evidence tidak valid.' }, { status: 400 });
  const data = parsed.data;
  if (!(await canAccessApplication(user.id, user.role, data.pengajuanId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const evidence = await prisma.evidence.create({ data: { pengajuanId: data.pengajuanId, url: data.url, fileName: data.fileName, fileType: data.fileType, fileSize: data.fileSize, source: data.source, description: data.description, uploaderId: user.id } });
  await prisma.auditLog.create({ data: { pengajuanId: data.pengajuanId, actorId: user.id, action: 'EVIDENCE_ADDED', description: `Evidence ${data.fileName} ditambahkan.` } });
  return NextResponse.json(evidence);
}
