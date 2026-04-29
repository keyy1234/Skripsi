import React, { useEffect } from 'react';

// ── Data constants ────────────────────────────────────────────────────
const RIWAYAT_PENYAKIT_OPTIONS = ['Hipertensi', 'Diabetes Melitus', 'Jantung', 'Stroke', 'Asma', 'TBC', 'Gagal Ginjal', 'Kanker', 'HIV/AIDS', 'Hepatitis'];

const ALERGI_MAKANAN_LIST = [
  'Silakan Pilih', 'Seafood', 'Kacang Tanah', 'Susu Sapi', 'Telur',
  'Gluten (Gandum)', 'Kedelai', 'Udang', 'Kepiting', 'Coklat', 'Buah Citrus',
];

const KFA_OBAT_LIST = [
  'Amoxicillin', 'Amoksisilin', 'Ampisilin', 'Aspirin', 'Ibuprofen',
  'Parasetamol', 'Kodein', 'Tramadol', 'Morfin', 'Penicillin',
  'Sulfonamid', 'Metformin', 'Kaptopril', 'Amlodipine', 'Ceftriaxone',
  'Ciprofloxacin', 'Metronidazole', 'Omeprazole', 'Ranitidine', 'Antasida',
];

const CARA_MASUK_OPTIONS = ['Jalan Kaki', 'Kursi Roda', 'Brankar / Tempat Tidur', 'Digendong'];
const KONDISI_MASUK_OPTIONS = ['Baik', 'Sedang', 'Lemah', 'Kritis', 'Tidak Sadar'];
const SUMBER_INFORMASI_OPTIONS = ['Pasien Sendiri', 'Keluarga', 'Petugas Kesehatan', 'Rekam Medis', 'Lainnya'];
const BAHASA_OPTIONS = ['Indonesia', 'Daerah', 'Asing', 'Isyarat'];
const HAMBATAN_OPTIONS = ['Tidak Ada', 'Bahasa', 'Pendengaran', 'Penglihatan', 'Kognitif', 'Fisik'];

// ── KFA Obat Search ───────────────────────────────────────────────────
const KFASearch = ({ onSelect }) => {
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const results = q.length >= 1 ? KFA_OBAT_LIST.filter(o => o.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">
        <svg className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Cari KFA Obat"
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"/>
        <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
          {results.map(item => (
            <button key={item} onClick={() => { onSelect(item); setQ(''); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-teal-500 hover:text-white border-b border-gray-50 last:border-0 transition-colors">
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Components ────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{children}</p>
);

const SubLabel = ({ children }) => (
  <p className="text-sm font-semibold text-gray-700 mb-2">{children}</p>
);

const TagToggle = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className="px-3 py-1.5 rounded-md text-sm font-medium border transition-all"
    style={{
      background: active ? '#3b82f6' : '#ffffff',
      borderColor: active ? '#3b82f6' : '#d1d5db',
      color: active ? '#ffffff' : '#374151',
    }}>
    {label}
  </button>
);

const Sel = ({ options, value, onChange, placeholder }) => (
  <div className="relative">
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-700">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
    </svg>
  </div>
);

const AlergiRow = ({ item, onRemove, onKeteranganChange }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50">
    <td className="py-2.5 px-3 text-sm text-gray-700">{item.nama}</td>
    <td className="py-2.5 px-3">
      <input 
        value={item.keterangan || ''}
        onChange={(e) => onKeteranganChange(item.id, e.target.value)}
        placeholder="Keterangan..."
        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"/>
    </td>
    <td className="py-2.5 px-3 text-center">
      <button onClick={onRemove} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </td>
  </tr>
);

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - Menerima props dari parent
// ═══════════════════════════════════════════════════════════════════════
const Anamnesis = ({ patient, data, onDataChange }) => {
  // Data diterima dari parent, bukan state internal
  const {
    keluhanUtama = '',
    riwayatPasien = [],
    riwayatPasienTeks = '',
    riwayatKeluarga = [],
    riwayatKeluargaTeks = '',
    alergiMakanan = 'Silakan Pilih',
    listAlergiMakanan = [],
    listAlergiObat = [],
    caraMasuk = '',
    kondisiMasuk = '',
    sumberInfo = '',
    bahasa = '',
    hambatan = '',
    catatan = ''
  } = data || {};

  // Fungsi update yang memanggil onDataChange dari parent
  const updateField = (field, value) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
  };

  // Handler functions
  const toggleRiwayatPasien = (tag) => {
    const newList = riwayatPasien.includes(tag)
      ? riwayatPasien.filter(x => x !== tag)
      : [...riwayatPasien, tag];
    updateField('riwayatPasien', newList);
  };

  const toggleRiwayatKeluarga = (tag) => {
    const newList = riwayatKeluarga.includes(tag)
      ? riwayatKeluarga.filter(x => x !== tag)
      : [...riwayatKeluarga, tag];
    updateField('riwayatKeluarga', newList);
  };

  const tambahAlergiMakanan = () => {
    if (!alergiMakanan || alergiMakanan === 'Silakan Pilih') return;
    if (listAlergiMakanan.find(x => x.nama === alergiMakanan)) return;
    const newItem = { id: Date.now(), nama: alergiMakanan, keterangan: '' };
    updateField('listAlergiMakanan', [...listAlergiMakanan, newItem]);
    updateField('alergiMakanan', 'Silakan Pilih');
  };

  const hapusAlergiMakanan = (id) => {
    updateField('listAlergiMakanan', listAlergiMakanan.filter(x => x.id !== id));
  };

  const updateKeteranganAlergiMakanan = (id, keterangan) => {
    const updatedList = listAlergiMakanan.map(item =>
      item.id === id ? { ...item, keterangan } : item
    );
    updateField('listAlergiMakanan', updatedList);
  };

  const tambahAlergiObat = (nama) => {
    if (listAlergiObat.find(x => x.nama === nama)) return;
    const newItem = { id: Date.now(), nama, keterangan: '' };
    updateField('listAlergiObat', [...listAlergiObat, newItem]);
  };

  const hapusAlergiObat = (id) => {
    updateField('listAlergiObat', listAlergiObat.filter(x => x.id !== id));
  };

  const updateKeteranganAlergiObat = (id, keterangan) => {
    const updatedList = listAlergiObat.map(item =>
      item.id === id ? { ...item, keterangan } : item
    );
    updateField('listAlergiObat', updatedList);
  };

  return (
    <div className="p-6 space-y-8">

      {/* KELUHAN UTAMA */}
      <div>
        <SubLabel>Keluhan Utama</SubLabel>
        <textarea
          value={keluhanUtama}
          onChange={e => updateField('keluhanUtama', e.target.value)}
          rows={3}
          placeholder="Tulis keluhan utama pasien..."
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-800"
        />
      </div>

      <hr className="border-gray-100"/>

      {/* RIWAYAT PENYAKIT */}
      <div>
        <SectionTitle>Riwayat Penyakit</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pasien */}
          <div>
            <SubLabel>Riwayat Penyakit Pasien</SubLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {RIWAYAT_PENYAKIT_OPTIONS.map(tag => (
                <TagToggle key={tag} label={tag}
                  active={riwayatPasien.includes(tag)}
                  onClick={() => toggleRiwayatPasien(tag)}/>
              ))}
            </div>
            <textarea
              value={riwayatPasienTeks}
              onChange={e => updateField('riwayatPasienTeks', e.target.value)}
              rows={3}
              placeholder="Keterangan tambahan..."
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-800"
            />
          </div>

          {/* Keluarga */}
          <div>
            <SubLabel>Riwayat Penyakit Keluarga</SubLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {RIWAYAT_PENYAKIT_OPTIONS.map(tag => (
                <TagToggle key={tag} label={tag}
                  active={riwayatKeluarga.includes(tag)}
                  onClick={() => toggleRiwayatKeluarga(tag)}/>
              ))}
            </div>
            <textarea
              value={riwayatKeluargaTeks}
              onChange={e => updateField('riwayatKeluargaTeks', e.target.value)}
              rows={3}
              placeholder="Keterangan tambahan..."
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-800"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100"/>

      {/* RIWAYAT ALERGI */}
      <div>
        <SectionTitle>Riwayat Alergi</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Alergi Makanan & Lingkungan */}
          <div>
            <SubLabel>Alergi Makanan &amp; Lingkungan</SubLabel>
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <Sel options={ALERGI_MAKANAN_LIST} value={alergiMakanan}
                  onChange={v => updateField('alergiMakanan', v)} />
              </div>
              <button onClick={tambahAlergiMakanan}
                className="px-4 py-2.5 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition flex-shrink-0">
                + Tambah
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Alergi</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Keterangan</th>
                  <th className="w-8"/>
                </tr>
              </thead>
              <tbody>
                {listAlergiMakanan.length === 0
                  ? <tr><td colSpan={3} className="py-6 text-center text-sm text-gray-300">Belum ada data</td></tr>
                  : listAlergiMakanan.map(item => (
                    <AlergiRow 
                      key={item.id} 
                      item={item}
                      onRemove={() => hapusAlergiMakanan(item.id)}
                      onKeteranganChange={updateKeteranganAlergiMakanan}
                    />
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Alergi Obat */}
          <div>
            <SubLabel>Alergi Obat</SubLabel>
            <div className="mb-3">
              <KFASearch onSelect={tambahAlergiObat}/>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Nama Obat</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Keterangan</th>
                  <th className="w-8"/>
                </tr>
              </thead>
              <tbody>
                {listAlergiObat.length === 0
                  ? <tr><td colSpan={3} className="py-6 text-center text-sm text-gray-300">Belum ada data</td></tr>
                  : listAlergiObat.map(item => (
                    <AlergiRow 
                      key={item.id} 
                      item={item}
                      onRemove={() => hapusAlergiObat(item.id)}
                      onKeteranganChange={updateKeteranganAlergiObat}
                    />
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr className="border-gray-100"/>

      {/* CARA & KONDISI MASUK */}
      <div>
        <SectionTitle>Cara &amp; Kondisi Masuk</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SubLabel>Cara Masuk</SubLabel>
            <div className="flex flex-wrap gap-2">
              {CARA_MASUK_OPTIONS.map(opt => (
                <button key={opt} onClick={() => updateField('caraMasuk', opt)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                  style={{
                    background: caraMasuk === opt ? '#0d9488' : '#ffffff',
                    borderColor: caraMasuk === opt ? '#0d9488' : '#d1d5db',
                    color: caraMasuk === opt ? '#ffffff' : '#374151',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <SubLabel>Kondisi Masuk</SubLabel>
            <div className="flex flex-wrap gap-2">
              {KONDISI_MASUK_OPTIONS.map(opt => {
                const colorMap = {
                  'Baik': '#16a34a', 'Sedang': '#2563eb', 'Lemah': '#d97706',
                  'Kritis': '#dc2626', 'Tidak Sadar': '#7c3aed'
                };
                const isActive = kondisiMasuk === opt;
                return (
                  <button key={opt} onClick={() => updateField('kondisiMasuk', opt)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                    style={{
                      background: isActive ? colorMap[opt] : '#ffffff',
                      borderColor: isActive ? colorMap[opt] : '#d1d5db',
                      color: isActive ? '#ffffff' : '#374151',
                    }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100"/>

      {/* SUMBER INFORMASI & KOMUNIKASI */}
      <div>
        <SectionTitle>Sumber Informasi &amp; Komunikasi</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SubLabel>Sumber Informasi</SubLabel>
            <Sel options={SUMBER_INFORMASI_OPTIONS} value={sumberInfo}
              onChange={v => updateField('sumberInfo', v)} placeholder="Silakan Pilih"/>
          </div>
          <div>
            <SubLabel>Bahasa yang Digunakan</SubLabel>
            <Sel options={BAHASA_OPTIONS} value={bahasa}
              onChange={v => updateField('bahasa', v)} placeholder="Silakan Pilih"/>
          </div>
          <div>
            <SubLabel>Hambatan Komunikasi</SubLabel>
            <Sel options={HAMBATAN_OPTIONS} value={hambatan}
              onChange={v => updateField('hambatan', v)} placeholder="Silakan Pilih"/>
          </div>
        </div>
        <div className="mt-4">
          <SubLabel>Catatan Tambahan</SubLabel>
          <textarea value={catatan} onChange={e => updateField('catatan', e.target.value)}
            rows={3} placeholder="Catatan lainnya..."
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-800"/>
        </div>
      </div>

      {/* Catatan: Tombol simpan di parent (AsesMenKeperawatan), bukan di sini */}
    </div>
  );
};

export default Anamnesis;