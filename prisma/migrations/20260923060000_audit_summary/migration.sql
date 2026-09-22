CREATE TABLE "AuditSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "auditorHalal" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AuditSummary_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AuditSummaryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summaryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "finding" TEXT NOT NULL,
    "correction" TEXT NOT NULL,
    CONSTRAINT "AuditSummaryItem_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "AuditSummary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AuditSummary_pengajuanId_key" ON "AuditSummary"("pengajuanId");
CREATE INDEX "AuditSummaryItem_summaryId_sortOrder_idx" ON "AuditSummaryItem"("summaryId", "sortOrder");
