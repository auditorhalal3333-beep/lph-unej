export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
      <h1 className="text-5xl font-bold">LPH UNEJ</h1>
      <p className="text-xl text-gray-600">Sistem Audit Sertifikasi Halal</p>
      <p className="text-gray-500">Lembaga Pemeriksa Halal - Universitas Jember</p>
      <div className="flex gap-4">
        <a href="/login" className="btn btn-primary btn-lg">Login</a>
        <a href="/register" className="btn btn-secondary btn-lg">Register Penyelia</a>
      </div>
    </div>
  );
}
