'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

const SJPH_SECTIONS = [
  { type: 'KOMITMEN', title: 'Komitmen dan Tanggung Jawab', items: ['Kebijakan Halal', 'Poster Sosialisasi', 'SK Tim Manajemen Halal', 'Sertifikat Penyelia Halal', 'Materi Pelatihan', 'Foto Pelatihan', 'Daftar Hadir', 'NIB'] },
  { type: 'BAHAN', title: 'Bahan', items: ['Daftar Bahan Halal', 'Catatan Pembelian', 'Nota Pembelian', 'Form Pemeriksaan Bahan', 'Surat Bebas Babi', 'Surat Konsistensi Bahan'] },
  { type: 'PROSES', title: 'Proses Produk Halal', items: ['Diagram Alir Produksi', 'Denah Ruang Produksi', 'Catatan Penyimpanan', 'SOP Produksi', 'Video Pencucian'] },
  { type: 'PRODUK', title: 'Produk', items: ['Foto Produk', 'Foto Kemasan', 'Nama Produk', 'Kode Produksi'] },
  { type: 'EVALUASI', title: 'Pemantauan dan Evaluasi', items: ['Form Audit Internal', 'Daftar Hadir Audit'] },
];

export default function SJPHPage() {
  const params = useParams();
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Implementasi SJPH</h1>
      <div className="tabs">
        {SJPH_SECTIONS.map((sec, i) => (
          <button key={i} className={`tab ${activeSection === i ? 'tab-active' : ''}`} onClick={() => setActiveSection(i)}>
            {sec.title}
          </button>
        ))}
      </div>
      <div className="card bg-base-200 p-4">
        <h2 className="text-xl font-bold mb-4">{SJPH_SECTIONS[activeSection].title}</h2>
        <div className="space-y-4">
          {SJPH_SECTIONS[activeSection].items.map((item, i) => (
            <div key={i} className="form-control">
              <label className="label">{item}</label>
              <input type="text" placeholder="Link Google Drive" className="input input-bordered" />
              <input type="text" placeholder="Keterangan" className="input input-bordered mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
