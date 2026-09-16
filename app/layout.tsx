import './globals.css';

export const metadata = {
  title: 'LPH UNEJ — Sistem Audit Sertifikasi Halal',
  description: 'Sistem Audit Sertifikasi Halal Lembaga Pemeriksa Halal Universitas Jember',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>{children}</body></html>;
}
