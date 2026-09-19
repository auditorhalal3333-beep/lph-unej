import { prisma } from '@/lib/prisma';
import { UserManagement } from '@/components/user-management';

export default async function UsersPage() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, company: true, createdAt: true }, orderBy: { name: 'asc' } });
  return <UserManagement users={users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() }))} />;
}
