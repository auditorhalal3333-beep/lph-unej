'use client';
import { useState } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppTopbar } from './app-topbar';
export function DashboardShell({ children, role }: { children: React.ReactNode; role?: string }) { const [open, setOpen] = useState(false); return <div className="flex min-h-screen bg-[#f5faf8]"><AppSidebar role={role} open={open} onClose={() => setOpen(false)} /><div className="min-w-0 flex-1"><AppTopbar onMenu={() => setOpen(true)} /><main className="mx-auto max-w-[1440px] p-5 sm:p-8">{children}</main></div></div>; }
