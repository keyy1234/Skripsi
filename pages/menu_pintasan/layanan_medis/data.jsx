// data.js - Hanya data, tidak ada JSX!
export const DEFAULT_PATIENT = {
  noRM: '901262678',
  nama: 'Bagus Sudarmono',
  noRegistrasi: 'RI202604077485',
  dpjp: 'dr. Andi Saputra, Sp.B',
  jenisPasien: 'Umum',
  ruangan: 'Kamar Mawar 2 - TT-03',
  umur: '30 Thn',
  dikirimOleh: 'Praktek Dokter',
  tanggalMasuk: '07 April 2026, 00:28',
  tanggalKeluar: '-'
};

export const TINDAKAN_LIST = [
  { kode: 'T001', nama: 'Visite Dokter Spesialis', tarif: 150000 },
  { kode: 'T002', nama: 'Visite Dokter Umum', tarif: 75000 },
  { kode: 'T003', nama: 'Pemasangan Infus', tarif: 50000 },
  { kode: 'T004', nama: 'Pemasangan Kateter', tarif: 75000 },
  { kode: 'T005', nama: 'Injeksi Intravena', tarif: 35000 },
  { kode: 'T006', nama: 'Injeksi Intramuskular', tarif: 25000 },
  { kode: 'T007', nama: 'Pengambilan Darah Vena', tarif: 30000 },
  { kode: 'T008', nama: 'Pemasangan NGT', tarif: 100000 },
  { kode: 'T009', nama: 'Nebulisasi', tarif: 60000 },
  { kode: 'T010', nama: 'Perawatan Luka Kecil', tarif: 80000 },
  { kode: 'T011', nama: 'Perawatan Luka Sedang', tarif: 150000 },
  { kode: 'T012', nama: 'Perawatan Luka Besar', tarif: 250000 },
  { kode: 'T013', nama: 'Suction', tarif: 45000 },
  { kode: 'T014', nama: 'Transfusi Darah', tarif: 200000 },
  { kode: 'T015', nama: 'EKG', tarif: 120000 },
  { kode: 'T016', nama: 'Fisioterapi', tarif: 175000 },
  { kode: 'T017', nama: 'Oksigenasi', tarif: 40000 },
  { kode: 'T018', nama: 'Operasi Appendectomy', tarif: 5000000 },
  { kode: 'T019', nama: 'Operasi Caesar', tarif: 7500000 },
  { kode: 'T020', nama: 'Rontgen Thorax', tarif: 150000 },
  { kode: 'T021', nama: 'USG Abdomen', tarif: 250000 },
  { kode: 'T022', nama: 'CT-Scan', tarif: 1200000 },
  { kode: 'T023', nama: 'Konsultasi Gizi', tarif: 75000 }
];

export const DOKTER_SPESIALIS = [
  'Silakan Pilih',
  'Dr. Budi Santoso, Sp.PD',
  'Dr. Sarah Putri, Sp.OG',
  'Dr. Ahmad Fauzi, Sp.A',
  'Dr. Rina Wijaya, Sp.B',
  'Dr. Hendra Lim, Sp.JP'
];

export const DOKTER_UMUM = [
  'Silakan Pilih',
  'Dr. Ucok Sofyan',
  'Dr. Dewi Kartika',
  'Dr. Reza Pratama',
  'Dr. Siti Aminah'
];

export const PARAMEDIS_LIST = [
  'Silakan Pilih',
  'Ns. Ani Rahayu',
  'Ns. Budi Setiawan',
  'Ns. Clara Putri',
  'Bdn. Dewi Sari',
  'Ns. Erik Mahendra'
];

export const nowLabel = () => {
  const d = new Date();
  const bln = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()} ${hh}:${mm}:${ss}`;
};