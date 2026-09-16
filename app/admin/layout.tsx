import { DashboardShell } from '@/components/dashboard-shell';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) redirect(user.role === 'AUDITOR' ? '/auditor' : '/penyelia/dashboard');
  return <DashboardShell role={user.role}>{children}</DashboardShell>;
}
