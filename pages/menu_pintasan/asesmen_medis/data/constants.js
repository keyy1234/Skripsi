// ============================================
// MENU CONSTANTS
// ============================================

// LEFT MENU - Berdasarkan urutan alur integrasi SATUSEHAT
export const LEFT_MENU = [
  { id: 'anamnesis', label: 'Anamnesis' },
  { id: 'ttv', label: 'Tanda Vital' },
  { id: 'fisik', label: 'Pemeriksaan Fisik' },
  { id: 'fungsional', label: 'Pemeriksaan Fungsional' },
  { id: 'riwayat_perjalanan', label: 'Riwayat Perjalanan Penyakit' },
  // { id: 'tujuan_perawatan', label: 'Tujuan Perawatan' },
  // { id: 'penilaian_risiko', label: 'Penilaian Risiko' },
  // { id: 'penunjang', label: 'Pemeriksaan Penunjang' },
  // { id: 'diagnosa', label: 'Diagnosis' },
  // { id: 'rencana', label: 'Rencana Rawat' },
  // { id: 'prognosis', label: 'Prognosis' },
];

// TOP TABS
export const TOP_TABS = [
  { id: 'pemeriksaan', label: 'Pemeriksaan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
  // { id: 'diagnosa_awal', label: 'Diagnosa Awal', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  // { id: 'cppt', label: 'CPPT', icon: 'M4 6h16M4 10h16M4 14h16M4 18h7' },
  // { id: 'dpjp', label: 'DPJP', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

// ============================================
// ANAMNESIS - OPTIONS (untuk Anamnesis.jsx)
// ============================================
export const PENYAKIT_OPTIONS = ['Hipertensi', 'Diabetes Melitus', 'Jantung', 'Stroke'];
export const ALERGI_MAKANAN = ['Telur', 'Susu Sapi & Produk Olahannya', 'Kacang Kedelai/Tanah', 'Gluten/Gandum', 'Udang', 'Ikan', 'Kacang Pohon', 'Buah-buahan'];
export const ALERGI_OBAT = ['Penisilin', 'Sulfa', 'Aspirin', 'NSAID', 'Kodein', 'Morfin', 'Kontras Iodin', 'Latex'];

// ============================================
// PEMERIKSAAN FISIK
// ============================================
export const ORGAN_LIST = ['Kepala', 'Mata', 'Hidung', 'Gigi & Mulut', 'Tenggorokan', 'Telinga', 'Leher', 'Thoraks', 'Jantung', 'Paru', 'Abdomen', 'Ekstremitas Atas', 'Ekstremitas Bawah', 'Kulit', 'Genitalia', 'Anus & Rektum'];

// ============================================
// PEMERIKSAAN FUNGSIONAL (Bab 5 SATUSEHAT)
// ============================================
export const STATUS_PSIKOLOGIS = [
  { code: '17326005', label: 'Tidak ada kelainan (Well in self)' },
  { code: '48694002', label: 'Cemas (Feeling anxious)' },
  { code: '1402001', label: 'Takut (Afraid)' },
  { code: '75408008', label: 'Marah (Feeling angry)' },
  { code: '420038007', label: 'Sedih (Feeling unhappy)' },
  { code: '74964007', label: 'Lain-lain (Other)' },
];

export const TINGKAT_KESADARAN = [
  { code: '248234008', label: 'Sadar Baik/Alert (Mentally alert)' },
  { code: '300202002', label: 'Berespon dengan kata-kata/Voice' },
  { code: '450847001', label: 'Hanya berespons jika dirangsang nyeri/Pain' },
  { code: '422768004', label: 'Tidak sadar/Unresponsive' },
  { code: '130987000', label: 'Gelisah atau bingung/Acute confusion' },
  { code: '2776000', label: 'Delirium' },
];

// ============================================
// GCS OPTIONS (Glasgow Coma Scale)
// ============================================
export const E_OPTIONS = [
  { value: '4', label: '[4] Mata terbuka secara spontan terhadap rangsangan apapun' },
  { value: '3', label: '[3] Membuka mata terhadap suara' },
  { value: '2', label: '[2] Membuka mata terhadap nyeri' },
  { value: '1', label: '[1] Tidak ada respons' },
];

export const V_OPTIONS = [
  { value: '5', label: '[5] Menjawab dengan baik' },
  { value: '4', label: '[4] Bingung' },
  { value: '3', label: '[3] Kata-kata tidak tepat' },
  { value: '2', label: '[2] Suara tidak dimengerti' },
  { value: '1', label: '[1] Tidak ada respons' },
];

export const M_OPTIONS = [
  { value: '6', label: '[6] Melakukan gerakan yang diminta' },
  { value: '5', label: '[5] Menunjuk tempat rangsangan nyeri' },
  { value: '4', label: '[4] Menghindari rangsangan nyeri' },
  { value: '3', label: '[3] Fleksi abnormal' },
  { value: '2', label: '[2] Ekstensi abnormal' },
  { value: '1', label: '[1] Tidak ada respons' },
];

// ============================================
// PENILAIAN RISIKO (Bab 14 SATUSEHAT)
// ============================================
export const PENILAIAN_RISIKO = [
  { id: 'resiko_jatuh', label: 'Risiko Jatuh', options: ['Rendah', 'Sedang', 'Tinggi'] },
  { id: 'resiko_dekubitus', label: 'Risiko Dekubitus (Braden Scale)', options: ['Rendah (19-23)', 'Sedang (15-18)', 'Tinggi (13-14)', 'Sangat Tinggi (<13)'] },
  { id: 'resiko_gizi', label: 'Risiko Malnutrisi', options: ['Rendah', 'Sedang', 'Tinggi'] },
  { id: 'resiko_infeksi', label: 'Risiko Infeksi', options: ['Rendah', 'Sedang', 'Tinggi'] },
  { id: 'resiko_vena_tromboemboli', label: 'Risiko VTE (Caprini Score)', options: ['Rendah (0-1)', 'Sedang (2)', 'Tinggi (3-4)', 'Sangat Tinggi (>5)'] },
];

// ============================================
// PROGNOSIS (Bab 23 SATUSEHAT)
// ============================================
export const PROGNOSIS_OPTIONS = [
  { code: 'quoad_vitam', label: 'Quoad Vitam (Kehidupan)' },
  { code: 'quoad_fungtionem', label: 'Quoad Functionem (Fungsi)' },
  { code: 'quoad_sanationem', label: 'Quoad Sanationem (Kesembuhan)' },
];

export const PROGNOSIS_TINGKAT = [
  { value: 'bonam', label: 'Bonam (Baik)' },
  { value: 'dubia_ad_bonam', label: 'Dubia ad Bonam (Meragukan ke Baik)' },
  { value: 'dubia_ad_malam', label: 'Dubia ad Malam (Meragukan ke Buruk)' },
  { value: 'malam', label: 'Malam (Buruk)' },
  { value: 'incerta', label: 'Incerta (Tidak pasti)' },
];

// ============================================
// CARA KELUAR RUMAH SAKIT (Bab 25 SATUSEHAT)
// ============================================
export const CARA_KELUAR = [
  { code: '306706006', label: 'Sembuh' },
  { code: '183945003', label: 'Membaik' },
  { code: '188341000', label: 'Tidak Membaik' },
  { code: '371828006', label: 'Meninggal' },
  { code: '306689003', label: 'Dirujuk' },
  { code: '306684008', label: 'Pulang Atas Permintaan Sendiri (APS)' },
  { code: '306685009', label: 'Kabur' },
];

// ============================================
// DEFAULT PATIENT
// ============================================
export const DEFAULT_PATIENT = {
  noRM: '082389', 
  nama: 'IS**N**', 
  noRegistrasi: 'RI072024.0001',
  dpjp: 'Dokter Spesialis 10', 
  jenisPasien: 'Umum',
  ruangan: '[Kelas 1] Adenium 1.D', 
  umur: '86 Thn 0 Bln 26 Hari',
  dikirimOleh: 'Puskesmas', 
  tanggalMasuk: '27 Juli 2024', 
  tanggalKeluar: '-',
};

// ============================================
// SATUSEHAT MAPPING
// ============================================
export const SATUSEHAT_MAPPING = {
  encounterClass: 'IMP',
  encounterStatus: 'in-progress',
  
  vitalSignsCodes: {
    heartRate: '8867-4',
    respiratoryRate: '9279-1',
    systolicBP: '8480-6',
    diastolicBP: '8462-4',
    bodyTemperature: '8310-5',
    bodyHeight: '8302-2',
    bodyWeight: '29463-7',
    bodySurfaceArea: '8277-6',
  },
  
  functionalCodes: {
    mentalStatus: '8693-4',
    adlScore: '715823002',
  },
  
  diagnosisCategory: {
    chiefComplaint: 'chief-complaint',
    problemListItem: 'problem-list-item',
    previousCondition: 'previous-condition',
  },
};