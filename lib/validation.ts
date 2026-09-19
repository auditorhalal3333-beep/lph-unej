import { z } from 'zod';

export const applicationSchema = z.object({
  type: z.enum(['PELAKU_USAHA', 'SPPG']),
  companyName: z.string().trim().min(2, 'Nama perusahaan wajib diisi.'),
  factoryName: z.string().trim().min(2, 'Nama pabrik wajib diisi.'),
  ownerName: z.string().trim().min(2, 'Nama penanggung jawab wajib diisi.'),
  address: z.string().trim().min(5, 'Alamat wajib diisi.'),
  province: z.string().optional(),
  regency: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  nib: z.string().optional(),
  nibEvidenceUrl: z.string().url().optional().or(z.literal('')),
  sttd: z.string().optional(),
  registrationType: z.string().optional(),
  productGroup: z.string().optional(),
  supervisor: z.string().optional(),
  contact: z.string().optional(),
  companyOfficialName: z.string().trim().optional(),
  leadLphName: z.string().trim().optional(),
});

export const productSchema = z.object({
  pengajuanId: z.string().min(1),
  name: z.string().trim().min(2),
  type: z.string().trim().min(2),
  description: z.string().optional(),
  productionCode: z.string().optional(),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
});

export const ingredientSchema = z.object({
  pengajuanId: z.string().min(1),
  name: z.string().trim().min(2),
  brand: z.string().optional(),
  category: z.string().optional(),
  producer: z.string().optional(),
  supplier: z.string().optional(),
  hasSH: z.boolean(),
  shNumber: z.string().optional(),
  shDate: z.string().optional(),
  shEvidenceUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const findingSchema = z.object({
  pengajuanId: z.string().min(1),
  section: z.string().min(1),
  criterion: z.string().optional(),
  category: z.string().optional(),
  description: z.string().trim().min(5),
  instruction: z.string().optional(),
});

export const evidenceSchema = z.object({
  pengajuanId: z.string().min(1),
  url: z.string().url('Masukkan URL yang valid.'),
  fileName: z.string().trim().min(1),
  fileType: z.string().trim().min(1),
  fileSize: z.number().int().nonnegative().optional(),
  source: z.enum(['DRIVE', 'CLOUDINARY']).default('DRIVE'),
  description: z.string().optional(),
});
