import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const adminRoles = ['ADMIN', 'SUPER_ADMIN'];

async function adminOnly() {
  const user = await getCurrentUser();
  return user && adminRoles.includes(user.role) ? user : null;
}

export async function GET() {
  const user = await adminOnly();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [auditors, chairs] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: ['AUDITOR', 'ADMIN'] } }, select: { id: true, name: true, email: true, role: true, title: true, active: true }, orderBy: { name: 'asc' } }),
    prisma.lphSignatory.findMany({ orderBy: [{ active: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }] }),
  ]);
  return NextResponse.json({ auditors, chairs });
}

export async function POST(req: Request) {
  const user = await adminOnly();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const kind = body.kind === 'CHAIR' ? 'CHAIR' : 'AUDITOR';
  const name = String(body.name || '').trim();
  const title = String(body.title || '').trim() || null;
  if (name.length < 2 || name.length > 120) return NextResponse.json({ error: 'Nama wajib 2–120 karakter.' }, { status: 400 });

  if (kind === 'CHAIR') {
    const chair = await prisma.lphSignatory.create({ data: { name, title } });
    return NextResponse.json(chair, { status: 201 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || password.length < 8) return NextResponse.json({ error: 'Email dan password minimal 8 karakter wajib diisi.' }, { status: 400 });
  try {
    const auditor = await prisma.user.create({ data: { name, title, email, password: await bcrypt.hash(password, 10), role: 'AUDITOR' }, select: { id: true, name: true, email: true, role: true, title: true, active: true } });
    return NextResponse.json(auditor, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Email auditor sudah digunakan atau data tidak valid.' }, { status: 400 });
  }
}
