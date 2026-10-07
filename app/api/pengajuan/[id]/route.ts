import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canAccessApplication } from "@/lib/auth";
import { applicationSchema } from "@/lib/validation";
import { changeApplicationStatus, writeAuditLog } from "@/lib/workflow";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessApplication(user.id, user.role, id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const pengajuan = await prisma.pengajuan.findUnique({
    where: { id },
    include: {
      officials: { orderBy: { sortOrder: "asc" } },
      products: { include: { materials: { include: { ingredient: true } } } },
      ingredients: true,
      sjphSections: { include: { items: true } },
      sjphResponses: {
        include: {
          criterion: { include: { category: true } },
          evidences: true,
        },
      },
      temuan: { include: { fixes: true, verifications: true } },
      evidences: true,
      auditResults: true,
      assignments: { include: { auditor: true } },
      auditLogs: { include: { actor: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!pengajuan)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pengajuan);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessApplication(user.id, user.role, id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  if (
    Object.keys(body).some((key) => key === "leadLphName") &&
    !["ADMIN", "SUPER_ADMIN", "AUDITOR"].includes(user.role)
  )
    return NextResponse.json(
      { error: "Hanya tim audit yang dapat mengisi Ketua LPH." },
      { status: 403 },
    );
  const parsed = applicationSchema.partial().safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  const officials =
    body.officials === undefined
      ? null
      : Array.isArray(body.officials)
        ? body.officials
            .filter((item: any) => item?.name?.trim())
            .map((item: any, index: number) => ({
              name: item.name.trim(),
              title: item.title?.trim() || null,
              sortOrder: index,
            }))
        : [];
  if (officials && !officials.length)
    return NextResponse.json(
      { error: "Minimal satu pejabat perusahaan wajib diisi." },
      { status: 400 },
    );
  if (officials && user.role !== "PENYELIA")
    return NextResponse.json(
      { error: "Hanya Penyelia yang dapat mengubah pejabat perusahaan." },
      { status: 403 },
    );
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.pengajuan.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(officials ? { companyOfficialName: officials[0].name } : {}),
      },
    });
    if (officials) {
      await tx.pengajuanOfficial.deleteMany({ where: { pengajuanId: id } });
      await tx.pengajuanOfficial.createMany({
        data: officials.map((item: any) => ({ ...item, pengajuanId: id })),
      });
    }
    return result;
  });
  await writeAuditLog(
    id,
    user.id,
    "APPLICATION_UPDATED",
    "Data pengajuan diperbarui.",
  );
  return NextResponse.json(updated);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessApplication(user.id, user.role, id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  const assignment =
    user.role === "AUDITOR"
      ? await prisma.auditAssignment.findFirst({
          where: { pengajuanId: id, auditorId: user.id },
        })
      : null;
  const isAssignedAuditor = user.role === "AUDITOR" && Boolean(assignment);
  const isOwnerSubmit = user.role === "PENYELIA" && body.status === "DIAJUKAN";
  if (!isAdmin && !isAssignedAuditor && !isOwnerSubmit)
    return NextResponse.json(
      { error: "Anda tidak dapat mengubah workflow pengajuan." },
      { status: 403 },
    );
  try {
    const updated = await changeApplicationStatus(
      id,
      body.status,
      user.id,
      body.description ?? "",
    );
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error && error.message === "INVALID_TRANSITION"
        ? "Perubahan status tidak diizinkan."
        : error instanceof Error &&
            error.message === "AUDITOR_IDENTITY_REQUIRED"
          ? "Nama auditor wajib diisi sebelum audit diselesaikan."
          : error instanceof Error && error.message === "OPEN_FINDINGS"
            ? "Masih ada temuan yang belum diverifikasi."
            : "Permintaan tidak dapat diproses.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

const DELETABLE_BY_OWNER = ["DRAFT", "DIAJUKAN"];

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pengajuan = await prisma.pengajuan.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true, companyName: true },
  });
  if (!pengajuan)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = user.role === "PENYELIA" && pengajuan.userId === user.id;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);

  if (!isOwner && !isAdmin)
    return NextResponse.json(
      { error: "Anda tidak dapat menghapus pengajuan ini." },
      { status: 403 },
    );

  if (isOwner && !DELETABLE_BY_OWNER.includes(pengajuan.status))
    return NextResponse.json(
      {
        error:
          "Pengajuan yang sudah masuk proses audit hanya dapat dihapus oleh admin.",
      },
      { status: 403 },
    );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productMaterial.deleteMany({
        where: { product: { pengajuanId: id } },
      });
      await tx.productMaterial.deleteMany({
        where: { ingredient: { pengajuanId: id } },
      });
      await tx.evidence.deleteMany({ where: { pengajuanId: id } });
      await tx.sjphItem.deleteMany({
        where: { section: { pengajuanId: id } },
      });
      await tx.sjphSection.deleteMany({ where: { pengajuanId: id } });
      await tx.temuanFix.deleteMany({
        where: { temuan: { pengajuanId: id } },
      });
      await tx.findingVerification.deleteMany({
        where: { finding: { pengajuanId: id } },
      });
      await tx.temuan.deleteMany({ where: { pengajuanId: id } });
      await tx.product.deleteMany({ where: { pengajuanId: id } });
      await tx.ingredient.deleteMany({ where: { pengajuanId: id } });
      await tx.sjphResponse.deleteMany({ where: { pengajuanId: id } });
      await tx.auditAssignment.deleteMany({ where: { pengajuanId: id } });
      await tx.auditResult.deleteMany({ where: { pengajuanId: id } });
      await tx.auditLog.deleteMany({ where: { pengajuanId: id } });
      await tx.report.deleteMany({ where: { pengajuanId: id } });
      await tx.notification.deleteMany({ where: { pengajuanId: id } });
      await tx.auditSummaryItem.deleteMany({
        where: { summary: { pengajuanId: id } },
      });
      await tx.auditSummary.deleteMany({ where: { pengajuanId: id } });
      await tx.pengajuanOfficial.deleteMany({ where: { pengajuanId: id } });
      await tx.pengajuan.delete({ where: { id } });
    });

    return NextResponse.json({ deleted: true, name: pengajuan.companyName });
  } catch (error) {
    console.error("DELETE /api/pengajuan/[id]", error);
    return NextResponse.json(
      { error: "Pengajuan gagal dihapus. Data terkait mungkin masih dipakai." },
      { status: 400 },
    );
  }
}
