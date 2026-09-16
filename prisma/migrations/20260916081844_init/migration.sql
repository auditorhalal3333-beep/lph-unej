-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PENYELIA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pengajuan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "companyName" TEXT NOT NULL,
    "factoryName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "nib" TEXT,
    "sttd" TEXT,
    "supervisor" TEXT,
    "contact" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pengajuan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Product_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "producer" TEXT,
    "supplier" TEXT,
    "hasSH" BOOLEAN NOT NULL DEFAULT false,
    "shNumber" TEXT,
    "shDate" DATETIME,
    "notes" TEXT,
    CONSTRAINT "Ingredient_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SjphSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    CONSTRAINT "SjphSection_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SjphItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "notes" TEXT,
    CONSTRAINT "SjphItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SjphSection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Temuan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PERLU_PERBAIKAN',
    CONSTRAINT "Temuan_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemuanFix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "temuanId" TEXT NOT NULL,
    "evidenceUrl" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "TemuanFix_temuanId_fkey" FOREIGN KEY ("temuanId") REFERENCES "Temuan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
