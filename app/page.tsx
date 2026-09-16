export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
      <h1 className="text-4xl font-bold">LPH UNEJ</h1>
      <p className="text-lg">Sistem Audit Sertifikasi Halal</p>
      <div className="flex gap-4">
        <a href="/login" className="btn btn-primary">Login</a>
        <a href="/penyelia/dashboard" className="btn btn-secondary">Penyelia</a>
      </div>
    </div>
  );
}
