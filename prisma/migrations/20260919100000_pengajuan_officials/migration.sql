-- CreateTable
CREATE TABLE "PengajuanOfficial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PengajuanOfficial_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PengajuanOfficial_pengajuanId_idx" ON "PengajuanOfficial"("pengajuanId");

-- Backfill legacy applications so existing reports keep their signatory.
INSERT INTO "PengajuanOfficial" ("id", "pengajuanId", "name", "sortOrder", "createdAt", "updatedAt")
SELECT lower(hex(randomblob(16))), "id", COALESCE(NULLIF("companyOfficialName", ''), "ownerName"), 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Pengajuan";
