import { DashboardShell } from '@/components/dashboard-shell';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'AUDITOR') redirect('/auditor');
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') redirect('/admin');
  return <DashboardShell role={user.role}>{children}</DashboardShell>;
}
