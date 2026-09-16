import { DashboardShell } from '@/components/dashboard-shell';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AuditorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!['AUDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) redirect('/penyelia/dashboard');
  return <DashboardShell role={user.role}>{children}</DashboardShell>;
}
