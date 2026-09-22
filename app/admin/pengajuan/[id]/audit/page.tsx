"use client";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Save,
  ShieldCheck,
  UserRound,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";

type Application = {
  id: string;
  auditNumber: string;
  companyName: string;
  factoryName: string;
  ownerName: string;
  companyOfficialName?: string | null;
  leadLphName?: string | null;
  officials?: { id: string; name: string; title: string | null }[];
  address: string;
  nib?: string | null;
  sttd?: string | null;
  supervisor?: string | null;
  type: string;
  status: string;
  auditDate?: string | null;
  products: any[];
  ingredients: any[];
  sjphResponses: any[];
  temuan: any[];
  auditResults: any[];
  evidences: any[];
  auditLogs: any[];
  assignments: any[];
};
const tabs = [
  { key: "overview", label: "Overview", icon: ClipboardCheck },
  { key: "company", label: "Perusahaan", icon: UserRound },
  { key: "products", label: "Produk", icon: FileText },
  { key: "materials", label: "Bahan", icon: ShieldCheck },
  { key: "sjph", label: "SJPH", icon: ClipboardCheck },
  { key: "summary", label: "Ringkasan", icon: FileText },
  { key: "signatures", label: "Penandatangan Laporan", icon: UserRound },
];
const resultOptions = [
  { value: "SESUAI", label: "Sesuai", cls: "text-[#08725b] bg-[#e7f5ef]" },
  {
    value: "PERLU_PERBAIKAN",
    label: "Perlu Perbaikan",
    cls: "text-[#a66a00] bg-[#fff4d7]",
  },
  {
    value: "TIDAK_SESUAI",
    label: "Tidak Sesuai",
    cls: "text-[#c54b39] bg-[#ffe6e2]",
  },
  {
    value: "TIDAK_BERLAKU",
    label: "Tidak Berlaku",
    cls: "text-[#647873] bg-[#edf2f1]",
  },
];
export default function AuditWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState("");
  const [finding, setFinding] = useState({
    section: "",
    criterion: "",
    description: "",
    instruction: "",
  });
  const [auditorName, setAuditorName] = useState("");
  const [auditorTitle, setAuditorTitle] = useState("");
  const [leadLphName, setLeadLphName] = useState("");
  const [chairs, setChairs] = useState<any[]>([]);
  const [selectedOfficialId, setSelectedOfficialId] = useState("");
  const [identityMessage, setIdentityMessage] = useState("");
  const [summary, setSummary] = useState({ summaryText: "", auditorHalal: "", items: [{ finding: "", correction: "" }] });
  const [summaryMessage, setSummaryMessage] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<
    Record<
      string,
      { items: { criterion: string; result: string }[]; comment: string }
    >
  >({});
  async function load() {
    const [res, cres, staffRes, summaryRes] = await Promise.all([
      fetch(`/api/pengajuan/${id}`),
      fetch(`/api/sjph/criteria?pengajuanId=${id}`),
      fetch('/api/admin/staff'),
      fetch(`/api/audit-summary/${id}`),
    ]);
    if (res.ok) {
      const data = await res.json();
      setApp(data);
      setLeadLphName(data.leadLphName || "");
      const assignment = data.assignments?.[0];
      if (assignment) {
        setAuditorName(
          assignment.auditorName || assignment.auditor?.name || "",
        );
        setAuditorTitle(assignment.auditorTitle || "");
      }
      setSelectedOfficialId(data.officials?.[0]?.id || "");
    }
    if (cres.ok) setCategories(await cres.json());
    if (staffRes.ok) { const staff = await staffRes.json(); setChairs(staff.chairs || []); }
    if (summaryRes.ok) {
      const saved = await summaryRes.json();
      setSummary({
        summaryText: saved.summaryText || "",
        auditorHalal: saved.auditorHalal || "",
        items: saved.items?.length ? saved.items.map((item: any) => ({ finding: item.finding || "", correction: item.correction || "" })) : [{ finding: "", correction: "" }],
      });
    }
  }
  useEffect(() => {
    load();
  }, [id]);
  async function saveAuditorIdentity() {
    const assignment = app?.assignments?.[0];
    if (!assignment) {
      setIdentityMessage("Assignment auditor belum tersedia.");
      return;
    }
    setBusy("identity");
    setIdentityMessage("");
    const res = await fetch("/api/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId: assignment.id,
        auditorName,
        auditorTitle,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setIdentityMessage("Identitas auditor tersimpan.");
      await load();
    } else
      setIdentityMessage(data.error || "Identitas auditor gagal disimpan.");
    setBusy("");
  }
  async function saveLeadLph() {
    if (!leadLphName.trim()) {
      setIdentityMessage("Nama Ketua LPH wajib diisi.");
      return;
    }
    setBusy("lead-lph");
    setIdentityMessage("");
    const res = await fetch(`/api/pengajuan/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadLphName: leadLphName.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setIdentityMessage("Identitas penandatangan tersimpan.");
      await load();
    } else setIdentityMessage(data.error || "Identitas gagal disimpan.");
    setBusy("");
  }
  async function finalizeAudit() {
    const official =
      app?.officials?.find((o) => o.id === selectedOfficialId) ||
      app?.officials?.[0];
    if (!leadLphName.trim() || !auditorName.trim() || !official) {
      setIdentityMessage(
        "Ketua LPH, auditor, dan pejabat auditee wajib dipilih.",
      );
      return;
    }
    if (app?.status === "SELESAI") {
      window.location.href = `/api/report/${id}`;
      return;
    }
    setBusy("finalize");
    setIdentityMessage("");
    const identity = await fetch("/api/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId: activeAssignment?.id,
        auditorName,
        auditorTitle,
      }),
    });
    if (!identity.ok) {
      const data = await identity.json();
      setIdentityMessage(data.error || "Identitas auditor gagal disimpan.");
      setBusy("");
      return;
    }
    const lead = await fetch(`/api/pengajuan/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadLphName: leadLphName.trim() }),
    });
    if (!lead.ok) {
      const data = await lead.json();
      setIdentityMessage(data.error || "Identitas laporan gagal disimpan.");
      setBusy("");
      return;
    }
    const res = await fetch(`/api/pengajuan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "SELESAI",
        description: "Audit selesai dan siap diterbitkan.",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setIdentityMessage(data.error || "Audit belum dapat diselesaikan.");
      setBusy("");
      return;
    }
    setIdentityMessage("Audit selesai. Laporan Word sedang diunduh.");
    setBusy("");
    window.location.href = `/api/report/${id}`;
  }
  async function startAudit() {
    setBusy("start");
    await fetch(`/api/pengajuan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "SEDANG_DIAUDIT",
        description: "Audit dimulai oleh auditor.",
      }),
    });
    await load();
    setBusy("");
  }
  async function saveResult(
    section: string,
    criterion: string,
    result: string,
    auditorNote: string,
  ) {
    setBusy(criterion);
    const res = await fetch("/api/audit-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pengajuanId: id,
        section,
        criterion,
        result,
        note: auditorNote,
      }),
    });
    if (res.ok) {
      await load();
    } else {
      const e = await res.json();
      alert(e.error);
    }
    setBusy("");
  }
  async function saveSummary() {
    setBusy("summary");
    setSummaryMessage("");
    try {
      const res = await fetch(`/api/audit-summary/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summary),
      });
      const data = await res.json();
      if (!res.ok) setSummaryMessage(data.error || "Ringkasan gagal disimpan.");
      else {
        setSummaryMessage("Ringkasan berhasil disimpan.");
        setSummary({
          summaryText: data.summaryText || "",
          auditorHalal: data.auditorHalal || "",
          items: data.items?.length ? data.items.map((item: any) => ({ finding: item.finding || "", correction: item.correction || "" })) : [{ finding: "", correction: "" }],
        });
      }
    } catch {
      setSummaryMessage("Ringkasan gagal disimpan. Periksa koneksi lalu coba lagi.");
    }
    setBusy("");
  }

  async function saveAllGroups() {
    setBusy("all-groups");
    const all = Object.values(drafts).flatMap((group) =>
      group.items.filter((item) => item.result).map((item) => ({ ...item, note: group.comment.trim() })),
    );
    if (!all.length) {
      setBusy("");
      alert("Pilih minimal satu hasil audit sebelum menyimpan.");
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    let res: Response;
    try {
      res = await fetch("/api/audit-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pengajuanId: id, section: "SJPH", results: all }),
        signal: controller.signal,
      });
    } catch {
      window.clearTimeout(timeout);
      setBusy("");
      alert("Penyimpanan terlalu lama atau koneksi terputus. Data isian tetap berada di halaman ini, silakan coba lagi.");
      return;
    }
    window.clearTimeout(timeout);
    if (res.ok) {
      await load();
    } else {
      const e = await res.json();
      alert(e.error);
    }
    setBusy("");
  }
  async function addFinding(e: React.FormEvent) {
    e.preventDefault();
    setBusy("finding");
    const res = await fetch("/api/temuan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pengajuanId: id, ...finding }),
    });
    if (res.ok) {
      setFinding({
        section: "",
        criterion: "",
        description: "",
        instruction: "",
      });
      await load();
    } else alert((await res.json()).error || "Temuan gagal disimpan.");
    setBusy("");
  }
  async function reviewFinding(
    id: string,
    status: "VERIFIED" | "REJECTED" | "CLOSED",
    note?: string,
  ) {
    setBusy(`verify-${id}`);
    const res = await fetch(`/api/temuan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    if (res.ok) await load();
    else alert((await res.json()).error || "Verifikasi gagal.");
    setBusy("");
  }
  if (!app)
    return (
      <div className="rounded-2xl border border-[#dce9e5] bg-white p-12 text-center text-sm text-[#71847f]">
        Memuat ruang audit...
      </div>
    );
  const activeAssignment = app.assignments?.[0];
  const results = new Map(
    app.auditResults.map((r) => [`${r.section}:${r.criterion}`, r]),
  );
  const statusText = app.status.replaceAll("_", " ");
  const responseByCriterion = new Map(
    app.sjphResponses.map((response: any) => [response.criterionId, response]),
  );
  const sjphDisplayGroups = (
    categories.length
      ? categories
      : [
          {
            code: "KOMITMEN",
            name: "Komitmen dan Tanggung Jawab",
            sortOrder: 1,
            criteria: [],
          },
        ]
  )
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((category: any) => [
      category.code,
      (category.criteria || []).map(
        (criterion: any) =>
          responseByCriterion.get(criterion.id) || {
            id: `missing-${criterion.id}`,
            criterion: { ...criterion, category },
            criterionId: criterion.id,
            providerStatus: "BELUM_DIISI",
            providerNotes: null,
            evidences: [],
          },
      ),
    ]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold text-[#08725b]">
            Ruang Kerja Auditor · {app.auditNumber}
          </p>
          <h1 className="display-font text-3xl font-extrabold tracking-[-.05em] text-[#10211e]">
            {app.companyName}
          </h1>
          <p className="mt-1 text-sm text-[#71847f]">
            {app.factoryName} · {app.type === "SPPG" ? "SPPG" : "Pelaku Usaha"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#fff4d7] px-3 py-1.5 text-[10px] font-bold text-[#a66a00]">
            {statusText}
          </span>
          {["MENUNGGU_AUDITOR", "MENUNGGU_REVIEW"].includes(app.status) && (
            <button
              onClick={startAudit}
              disabled={!!busy}
              className="rounded-xl bg-[#08725b] px-4 py-2.5 text-xs font-bold text-white"
            >
              {busy === "start" ? "Memulai..." : "Mulai Audit"}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[#dce9e5] bg-white p-2">
        <div className="flex min-w-max gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${tab === key ? "bg-[#e7f5ef] text-[#08725b]" : "text-[#71847f] hover:bg-[#f5f9f8]"}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>
      {tab === "overview" && <Overview app={app} setTab={setTab} />}{" "}
      {tab === "company" && (
        <Card title="Data Perusahaan">
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["Nama Perusahaan", app.companyName],
              ["Nama Pabrik / Usaha", app.factoryName],
              ["Penanggung Jawab", app.ownerName],
              ["Alamat", app.address],
              ["NIB", app.nib || "-"],
              ["STTD", app.sttd || "-"],
              [
                "Tanggal Audit",
                app.auditDate
                  ? new Date(app.auditDate).toLocaleDateString("id-ID")
                  : "Belum ditentukan",
              ],
              ["Penyelia", app.supervisor || "-"],
            ].map(([l, v]) => (
              <div key={String(l)}>
                <p className="text-[10px] font-bold text-[#8a9b97]">{l}</p>
                <p className="mt-1 text-sm text-[#234940]">{v}</p>
              </div>
            ))}
          </div>
        </Card>
      )}{" "}
      {tab === "products" && (
        <Card title={`Daftar Produk (${app.products.length})`}>
          <SimpleTable
            headers={["No.", "Nama Produk", "Jenis", "Kode Produksi"]}
            rows={app.products.map((p, i) => [
              String(i + 1),
              p.name,
              p.type,
              p.productionCode || "-",
            ])}
          />
        </Card>
      )}{" "}
      {tab === "materials" && (
        <Card title={`Daftar Bahan (${app.ingredients.length})`}>
          <SimpleTable
            headers={[
              "No.",
              "Bahan",
              "Produsen",
              "Sertifikat Halal",
              "Keterangan",
            ]}
            rows={app.ingredients.map((m, i) => [
              String(i + 1),
              m.name,
              m.producer || "-",
              m.hasSH ? "Ada" : "Tidak ada",
              m.hasSH ? `V SH BPJPH NO. ${m.shNumber}` : "Perlu pemeriksaan",
            ])}
          />
        </Card>
      )}{" "}
      {tab === "sjph" && (
        <Card title="Pemeriksaan Implementasi SJPH">
          <div className="space-y-6">
            {sjphDisplayGroups.map(([code, items]) => (
              <AuditGroup
                key={code}
                code={code as string}
                items={items as any[]}
                results={results}
                onChange={(groupCode, groupItems, comment) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [groupCode]: { items: groupItems, comment },
                  }))
                }
                busy={busy}
              />
            ))}
          </div>
          <div className="mt-8 border-t border-[#edf3f1] pt-5">
            <button
              disabled={busy === "all-groups"}
              onClick={saveAllGroups}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#08725b] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"
            >
              {busy === "all-groups" ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Save size={14} />
              )}{" "}
              Simpan Semua Hasil Audit
            </button>
            <p className="mt-2 text-center text-[10px] text-[#71847f]">
              Simpan hasil yang sudah diisi. Kriteria yang kosong akan dilewati.
            </p>
          </div>
        </Card>
      )}{" "}
      {tab === "summary" && (
        <Card title="Ringkasan Hasil Pemeriksaan dan Rencana Tindak Lanjut">
          <div className="space-y-5">
            <p className="text-sm italic text-[#526b66]">(disampaikan saat closing meeting)</p>
            <div className="rounded-xl border border-[#dce9e5] p-4">
              <label className="text-xs font-bold text-[#183b34]">Ringkasan</label>
              <textarea
                value={summary.summaryText}
                onChange={(e) => setSummary((prev) => ({ ...prev, summaryText: e.target.value }))}
                placeholder="Ketik ringkasan hasil pemeriksaan dan rencana tindak lanjut..."
                rows={5}
                className="mt-2 w-full rounded-xl border border-[#dce9e5] px-3 py-3 text-sm outline-none focus:border-[#0a8065]"
              />
            </div>
            <div className="rounded-xl border border-[#dce9e5] p-4">
              <label className="text-xs font-bold text-[#183b34]">Auditor Halal</label>
              <textarea
                value={summary.auditorHalal}
                onChange={(e) => setSummary((prev) => ({ ...prev, auditorHalal: e.target.value }))}
                placeholder="Ketik nama atau keterangan Auditor Halal..."
                rows={3}
                className="mt-2 w-full rounded-xl border border-[#dce9e5] px-3 py-3 text-sm outline-none focus:border-[#0a8065]"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {summary.items.map((item, index) => (
                <div key={index} className="rounded-xl border border-[#dce9e5] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#183b34]">{index + 1}. Temuan</span>
                    <button type="button" onClick={() => setSummary((prev) => ({ ...prev, items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : [{ finding: "", correction: "" }] }))} className="text-[#c54b39]" aria-label="Hapus baris"><Trash2 size={15} /></button>
                  </div>
                  <textarea value={item.finding} onChange={(e) => setSummary((prev) => ({ ...prev, items: prev.items.map((row, i) => i === index ? { ...row, finding: e.target.value } : row) }))} rows={5} placeholder="Tuliskan temuan..." className="w-full rounded-xl border border-[#dce9e5] px-3 py-3 text-sm outline-none focus:border-[#0a8065]" />
                  <label className="mt-3 block text-xs font-bold text-[#183b34]">Perbaikan</label>
                  <textarea value={item.correction} onChange={(e) => setSummary((prev) => ({ ...prev, items: prev.items.map((row, i) => i === index ? { ...row, correction: e.target.value } : row) }))} rows={5} placeholder="Tuliskan perbaikan..." className="mt-2 w-full rounded-xl border border-[#dce9e5] px-3 py-3 text-sm outline-none focus:border-[#0a8065]" />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setSummary((prev) => ({ ...prev, items: [...prev.items, { finding: "", correction: "" }] }))} className="inline-flex items-center gap-2 rounded-xl border border-[#bde4d2] px-4 py-2.5 text-xs font-bold text-[#08725b]"><Plus size={14} /> Tambah baris</button>
            {summaryMessage && <p className="text-xs font-semibold text-[#08725b]">{summaryMessage}</p>}
            <button type="button" onClick={saveSummary} disabled={busy === "summary"} className="inline-flex items-center gap-2 rounded-xl bg-[#08725b] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"><Save size={14} />{busy === "summary" ? "Menyimpan..." : "Simpan Ringkasan"}</button>
          </div>
        </Card>
      )}{" "}
      {tab === "signatures" && (
        <Card title="Penandatangan Laporan">
          <div className="space-y-5">
            <div className="rounded-xl border border-[#dce9e5] bg-[#fbfdfc] p-4">
              <p className="text-[10px] font-bold text-[#8a9b97]">KETUA LPH</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <select value={leadLphName} onChange={(e) => setLeadLphName(e.target.value)} className="h-10 w-full rounded-xl border border-[#dce9e5] bg-white px-3 text-xs outline-none focus:border-[#0a8065]"><option value="">Pilih Ketua LPH</option>{chairs.filter((chair) => chair.active).map((chair) => <option key={chair.id} value={`${chair.name}${chair.title ? `, ${chair.title}` : ''}`}>{chair.name}{chair.title ? ` · ${chair.title}` : ''}</option>)}</select>
                <button
                  onClick={saveLeadLph}
                  disabled={busy === "lead-lph"}
                  className="rounded-xl bg-[#08725b] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {busy === "lead-lph" ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-[#dce9e5] p-4">
              <p className="text-[10px] font-bold text-[#8a9b97]">AUDITOR</p>
              <div className="mt-2 grid gap-3"><input value={auditorName} onChange={(e) => setAuditorName(e.target.value)} placeholder="Nama auditor" className="h-10 rounded-xl border border-[#dce9e5] px-3 text-xs outline-none focus:border-[#0a8065]" /></div>
              <p className="mt-2 text-[10px] text-[#71847f]">Nama auditor diambil dari assignment dan dapat disesuaikan sebelum laporan diterbitkan.</p>
            </div>
            <div className="rounded-xl border border-[#dce9e5] p-4">
              <p className="text-[10px] font-bold text-[#8a9b97]">AUDITEE / PEJABAT PERUSAHAAN</p>
              <select value={selectedOfficialId} onChange={(e) => setSelectedOfficialId(e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-[#dce9e5] bg-white px-3 text-xs outline-none focus:border-[#0a8065]"><option value="">Pilih pejabat perusahaan</option>{(app.officials || []).map((o) => <option key={o.id} value={o.id}>{o.name}{o.title ? ` · ${o.title}` : ""}</option>)}</select>
              <p className="mt-2 text-[10px] text-[#71847f]">Opsi otomatis berasal dari daftar pejabat yang diisi Penyelia. Semua pejabat tetap dicantumkan dalam laporan.</p>
            </div>
            {identityMessage && <p className="text-xs font-semibold text-[#08725b]">{identityMessage}</p>}
            <div className="flex flex-wrap gap-3 border-t border-[#edf3f1] pt-5">
              <button onClick={finalizeAudit} disabled={!!busy || !activeAssignment} className="inline-flex items-center gap-2 rounded-xl bg-[#08725b] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{busy === "finalize" ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {app.status === "SELESAI" ? "Simpan & Download Laporan" : "Simpan Audit & Download Laporan"}</button>
              {app.status === "SELESAI" && <a href={`/api/report/${id}`} className="inline-flex items-center gap-2 rounded-xl border border-[#bde4d2] bg-white px-5 py-3 text-xs font-bold text-[#08725b]"><Download size={14} /> Download Laporan Word</a>}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#dce9e5] bg-white p-5 shadow-[0_6px_20px_rgba(7,91,73,.035)] sm:p-7">
      <h2 className="display-font mb-5 text-lg font-bold text-[#183b34]">
        {title}
      </h2>
      {children}
    </section>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#cfe2dc] p-8 text-center text-xs text-[#71847f]">
      {text}
    </div>
  );
}
function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-xs">
        <thead className="bg-[#fbfdfc] text-[10px] font-bold text-[#8a9b97]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[#edf3f1] text-[#526b66]">
              {row.map((v, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 ${j === 1 ? "font-semibold text-[#234940]" : ""}`}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Overview({
  app,
  setTab,
}: {
  app: Application;
  setTab: (v: string) => void;
}) {
  const assignment = app.assignments?.[0];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Produk", app.products.length, "products"],
          ["Bahan", app.ingredients.length, "materials"],
        ].map(([l, v, t]) => (
          <button
            key={String(l)}
            onClick={() => setTab(String(t))}
            className="rounded-2xl border border-[#dce9e5] bg-white p-5 text-left hover:border-[#8cc7b1]"
          >
            <p className="text-xs text-[#71847f]">{l}</p>
            <p className="display-font mt-2 text-3xl font-extrabold text-[#183b34]">
              {v}
            </p>
            <p className="mt-2 text-[10px] font-bold text-[#08725b]">
              Buka pemeriksaan <ChevronRight className="inline" size={12} />
            </p>
          </button>
        ))}
      </div>
      <Card title="Ringkasan Audit">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold text-[#8a9b97]">Nomor Audit</p>
            <p className="mt-1 text-sm font-semibold text-[#08725b]">
              {app.auditNumber}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8a9b97]">Auditor</p>
            <p className="mt-1 text-sm text-[#234940]">
              {assignment
                ? `${assignment.auditorName || assignment.auditor?.name || "Belum diisi"}${assignment.auditorTitle ? `, ${assignment.auditorTitle}` : ""}`
                : "Belum ditetapkan"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8a9b97]">Ketua LPH</p>
            <p className="mt-1 text-sm text-[#234940]">
              {app.leadLphName || "Belum diisi"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
function AuditGroup({
  code,
  items,
  results,
  onChange,
  busy,
}: {
  code: string;
  items: any[];
  results: Map<string, any>;
  onChange: (
    code: string,
    items: { criterion: string; result: string }[],
    comment: string,
  ) => void;
  busy: string;
}) {
  const groupBusy = busy === "all-groups";
  const initialItems = items.map((r) => {
    const saved = results.get(
      `${r.criterion.category.code}:${r.criterion.title}`,
    );
    return { criterion: r.criterion.title, result: saved?.result || "" };
  });
  const [itemsState, setItemsState] =
    useState<{ criterion: string; result: string }[]>(initialItems);
  const [comment, setComment] = useState("");
  const hasProviderData = (r: any) =>
    Boolean(r.providerNotes || r.evidences?.length);
  return (
    <div className="rounded-2xl border border-[#e2eeeb] bg-[#fbfdfc] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="display-font text-base font-bold text-[#183b34]">
            {items[0]?.criterion.category.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-[#8a9b97]">
            {items.length} kriteria dinilai sebagai satu kelompok
          </p>
        </div>
        <span className="rounded-full bg-[#e7f5ef] px-3 py-1 text-[10px] font-bold text-[#08725b]">
          {code}
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(320px,1.2fr)_minmax(260px,1fr)] lg:items-start">
        <div className="rounded-xl border border-[#dce9e5] bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(110px,auto)] gap-2 border-b border-[#edf3f1] bg-[#fbfdfc] px-3 py-2.5 text-[10px] font-bold text-[#8a9b97]">
            <span>BUKTI / KETERANGAN</span>
            <span className="text-right">HASIL</span>
          </div>
          <div className="divide-y divide-[#edf3f1]">
            {items.map((r: any, i: number) => {
              const st = itemsState[i] || {
                criterion: r.criterion.title,
                result: "",
              };
              const missing = !hasProviderData(r);
              return (
                <div
                  key={r.id}
                  className={`px-3 py-3 ${missing ? "bg-[#fffaf8]" : ""}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <span className="text-[11px] font-bold text-[#8a9b97]">
                        {i + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#234940]">
                          {r.criterion.title}
                        </p>
                        {(r.evidences || []).length > 0 && (
                          <div className="mt-1 space-y-1">
                            {(r.evidences || []).map((e: any) => (
                              <a
                                key={e.id}
                                href={e.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-semibold text-[#08725b] underline"
                              >
                                <ExternalLink size={10} />
                                <span className="truncate">
                                  {e.fileName || e.url}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                        {r.providerNotes && (
                          <p className="mt-1 truncate text-[10px] text-[#526b66]">
                            {r.providerNotes}
                          </p>
                        )}
                        {missing && (
                          <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#c54b39]">
                            <AlertCircle size={10} /> Belum diisi oleh penyelia
                          </p>
                        )}
                      </div>
                    </div>
                    <select
                      value={st.result}
                      onChange={(e) => {
                        const next = itemsState.map((x, j) =>
                          j === i ? { ...x, result: e.target.value } : x,
                        );
                        setItemsState(next);
                        onChange(code, next, comment);
                      }}
                      className={`h-8 shrink-0 rounded-lg border px-2 text-[10px] font-bold outline-none ${st.result ? { SESUAI: "border-[#bde4d2] bg-[#e7f5ef] text-[#08725b]", PERLU_PERBAIKAN: "border-[#f0e0b0] bg-[#fff4d7] text-[#a66a00]", TIDAK_SESUAI: "border-[#f1cfc8] bg-[#ffe6e2] text-[#c54b39]", TIDAK_BERLAKU: "border-[#dce9e5] bg-[#edf2f1] text-[#647873]" }[st.result] || "" : "border-[#dce9e5] bg-white text-[#71847f]"}`}
                    >
                      <option value="">Pilih hasil</option>
                      {resultOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-bold text-[#8a9b97]">
            HASIL AUDIT KELOMPOK
          </p>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              onChange(code, itemsState, e.target.value);
            }}
            placeholder="Tulis komentar/uraian hasil audit untuk satu kelompok ini..."
            rows={10}
            className="w-full rounded-xl border border-[#dce9e5] bg-white px-3 py-2 text-xs outline-none focus:border-[#0a8065]"
          />
          <p className="mt-2 text-[10px] text-[#71847f]">
            Komentar ini muncul di kolom Hasil Audit pada laporan untuk kelompok{" "}
            {items[0]?.criterion.category.name}. Jika ada kriteria yang perlu
            diperbaiki, jelaskan di komentar ini agar penyelia tahu apa yang
            harus diperbaiki.
          </p>
        </div>
      </div>
    </div>
  );
}
