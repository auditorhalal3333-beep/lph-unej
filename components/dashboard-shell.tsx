'use client';
import { useState } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppTopbar } from './app-topbar';
export function DashboardShell({ children }: { children: React.ReactNode }) { const [open, setOpen] = useState(false); return <div className="flex min-h-screen bg-[#f5faf8]"><AppSidebar open={open} onClose={() => setOpen(false)} /><div className="min-w-0 flex-1"><AppTopbar onMenu={() => setOpen(true)} /><main className="mx-auto max-w-[1440px] p-5 sm:p-8">{children}</main></div></div>; }
