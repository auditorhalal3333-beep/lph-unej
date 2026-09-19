import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function adminOnly() {
  const user = await getCurrentUser();
  return user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? user : null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await adminOnly();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const kind = body.kind === 'CHAIR' ? 'CHAIR' : 'AUDITOR';
  const name = String(body.name || '').trim();
  const title = String(body.title || '').trim() || null;
  const active = body.active !== false;
  if (name.length < 2 || name.length > 120) return NextResponse.json({ error: 'Nama wajib 2–120 karakter.' }, { status: 400 });
  try {
    if (kind === 'CHAIR') return NextResponse.json(await prisma.lphSignatory.update({ where: { id }, data: { name, title, active } }));
    return NextResponse.json(await prisma.user.update({ where: { id }, data: { name, title, active }, select: { id: true, name: true, email: true, role: true, title: true, active: true } }));
  } catch {
    return NextResponse.json({ error: 'Data tidak ditemukan atau tidak dapat diperbarui.' }, { status: 404 });
  }
}
