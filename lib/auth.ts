import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'AUDITOR' | 'PENYELIA';

export async function getCurrentUser() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireRole(roles: AppRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role as AppRole)) throw new Error('FORBIDDEN');
  return user;
}

export async function canAccessApplication(userId: string, role: string, applicationId: string) {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;
  if (role === 'AUDITOR') {
    const assignment = await prisma.auditAssignment.findFirst({ where: { pengajuanId: applicationId, auditorId: userId } });
    return Boolean(assignment);
  }
  const application = await prisma.pengajuan.findFirst({ where: { id: applicationId, userId } });
  return Boolean(application);
}

export function publicError(error: unknown) {
  if (error instanceof Error && error.message === 'FORBIDDEN') return { error: 'Anda tidak memiliki akses ke data ini.', status: 403 };
  if (error instanceof Error && error.message === 'UNAUTHORIZED') return { error: 'Silakan masuk terlebih dahulu.', status: 401 };
  return { error: 'Permintaan tidak dapat diproses.', status: 400 };
}
