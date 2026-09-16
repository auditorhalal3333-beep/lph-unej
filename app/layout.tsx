import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LPH UNEJ',
  description: 'Sistem Audit Halal LPH UNEJ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light">
      <body className={inter.className}>
        <nav className="navbar bg-base-100 shadow mb-4">
          <div className="container mx-auto flex gap-4 p-4">
            <Link href="/" className="btn btn-ghost text-xl">LPH UNEJ</Link>
            <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
            <Link href="/admin" className="btn btn-ghost">Admin</Link>
            <Link href="/login" className="btn btn-ghost">Login</Link>
            <Link href="/register" className="btn btn-ghost">Register</Link>
            <Link href="/penyelia/dashboard" className="btn btn-ghost">Penyelia</Link>
          </div>
        </nav>
        <main className="container mx-auto">{children}</main>
      </body>
    </html>
  );
}
