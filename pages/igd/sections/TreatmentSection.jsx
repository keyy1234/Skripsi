// src/pages/igd/sections/TreatmentSection.jsx
import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Daftar tindakan medis dengan tarif
const TINDAKAN_LIST = [
  // TINDAKAN MEDIS DASAR
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
  { kode: 'T015', nama: 'EKG / Elektrokardiogram', tarif: 120000 },
  { kode: 'T016', nama: 'Fisioterapi', tarif: 175000 },
  { kode: 'T017', nama: 'Oksigenasi Nasal Kanul', tarif: 40000 },
  { kode: 'T018', nama: 'Oksigenasi Masker', tarif: 55000 },
  { kode: 'T019', nama: 'Pemantauan Saturasi', tarif: 25000 },
  { kode: 'T020', nama: 'Tindakan Resusitasi', tarif: 500000 },

  // TINDAKAN OPERASI
  { kode: 'T021', nama: 'Operasi Appendectomy (Usus Buntu)', tarif: 5000000 },
  { kode: 'T022', nama: 'Operasi Caesar (SC)', tarif: 7500000 },
  { kode: 'T023', nama: 'Operasi Hernia', tarif: 4000000 },
  { kode: 'T024', nama: 'Operasi Batu Empedu', tarif: 6000000 },
  { kode: 'T025', nama: 'Operasi Tumor / Mastektomi', tarif: 8000000 },
  { kode: 'T026', nama: 'Operasi Katarak', tarif: 3500000 },
  { kode: 'T027', nama: 'Operasi Tonsilektomi', tarif: 2500000 },
  { kode: 'T028', nama: 'Operasi Fraktur', tarif: 5500000 },

  // PEMBERIAN OBAT
  { kode: 'M001', nama: 'Pemberian Obat Oral', tarif: 15000 },
  { kode: 'M002', nama: 'Pemberian Obat Intravena', tarif: 25000 },
  { kode: 'M003', nama: 'Pemberian Obat Intramuskular', tarif: 20000 },
  { kode: 'M004', nama: 'Pemberian Obat Subkutan', tarif: 20000 },
  { kode: 'M005', nama: 'Pemberian Obat Topikal', tarif: 15000 },
];

// Daftar rute pemberian obat
const RUTE_OBAT = [
  { value: 'ORAL', label: 'Oral / Minum' },
  { value: 'IV', label: 'Intravena (IV)' },
  { value: 'IM', label: 'Intramuskular (IM)' },
  { value: 'SC', label: 'Subkutan (SC)' },
  { value: 'TOPICAL', label: 'Topikal / Oles' }
];

// Daftar frekuensi
const FREKUENSI_LIST = [
  { value: '1x1', label: '1x sehari' },
  { value: '2x1', label: '2x sehari' },
  { value: '3x1', label: '3x sehari' },
  { value: 'once', label: 'Sekali' },
  { value: 'prn', label: 'PRN (Jika perlu)' }
];

// Komponen Search Dropdown
const TindakanSearch = ({ value, onChange }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = q.length >= 1
    ? TINDAKAN_LIST.filter(t =>
        t.nama.toLowerCase().includes(q.toLowerCase()) ||
        t.kode.toLowerCase().includes(q.toLowerCase()))
    : TINDAKAN_LIST;

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-teal-400">
        <svg className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={value ? value.nama : q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); if (value) onChange(null); }}
          onFocus={() => setOpen(true)}
          placeholder="Cari tindakan medis / obat..."
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-gray-700"
        />
        {value ? (
          <button onClick={() => { onChange(null); setQ(''); }} className="px-3 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-400 text-center">Tidak ditemukan</div>
          ) : (
            results.map(item => (
              <button
                key={item.kode}
                onClick={() => { onChange(item); setOpen(false); setQ(''); }}
                className="w-full text-left px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-teal-500 hover:text-white group transition-colors flex items-center justify-between"
              >
                <span className="text-sm text-gray-800 group-hover:text-white">{item.nama}</span>
                <span className="text-xs text-gray-400 group-hover:text-teal-100 ml-4 whitespace-nowrap">
                  Rp {item.tarif.toLocaleString('id-ID')}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Komponen Select
const Select = ({ options, value, onChange, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-teal-400 text-gray-700"
    >
      <option value="">{placeholder || '-- Pilih --'}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

const nowLabel = () => {
  const d = new Date();
  const bln = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()} ${hh}:${mm}`;
};

const TreatmentSection = ({ encounterId, encounter }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [treatmentsList, setTreatmentsList] = useState([]);
  const [medicProfilesList, setMedicProfilesList] = useState([]);
  
  // Form state
  const [form, setForm] = useState({
    tindakan: null,
    dokter_sp: '',
    dokter_um: '',
    perawat: '',
    tarif: '0',
    potongan: '0',
    jumlah: '1',
    dosis: '',
    rute: '',
    frekuensi: '',
    durasi: '',
    catatan: '',
    administered_at: nowLabel()
  });

  // Get token
  const getToken = () => localStorage.getItem('token');

  // Fetch with auth (menggunakan fetch native)
  const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  };

  // Fetch daftar tenaga medis
  const fetchMedicProfiles = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/medic-staff`);
      if (data.success) {
        setMedicProfilesList(data.data);
      }
    } catch (err) {
      console.error('Fetch medic profiles error:', err);
    }
  };

  // Fetch riwayat treatments
  const fetchTreatmentsHistory = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/treatments/${encounterId}`);
      if (data.success) {
        setTreatmentsList(data.data);
      }
    } catch (err) {
      console.error('Fetch treatments error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Hitung subtotal
  const tarif = parseFloat(form.tarif) || 0;
  const potongan = parseFloat(form.potongan) || 0;
  const jumlah = parseFloat(form.jumlah) || 1;
  const subtotal = Math.max(0, (tarif - potongan) * jumlah);

  // Handle pilih tindakan
  const handleTindakanChange = (item) => {
    setForm(prev => ({
      ...prev,
      tindakan: item,
      tarif: item ? String(item.tarif) : '0',
      potongan: '0'
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.tindakan) {
      alert('Pilih tindakan/layanan terlebih dahulu');
      return;
    }

    const treatmentDetails = {
      treatment_name: form.tindakan.nama,
      kode_tindakan: form.tindakan.kode,
      dosage: form.dosis || null,
      route: form.rute || null,
      frequency: form.frekuensi || null,
      duration: form.durasi || null,
      notes: form.catatan || null,
      tarif: tarif,
      potongan: potongan,
      jumlah: jumlah,
      subtotal: subtotal,
      dokter_sp: form.dokter_sp || null,
      dokter_um: form.dokter_um || null,
      perawat: form.perawat || null
    };

    // Tentukan treatment_type berdasarkan kode
    const treatmentType = form.tindakan.kode.startsWith('M') ? 'MEDICATION' : 'PROCEDURE';

    // Tentukan administered_by (prioritas: perawat -> dokter_um -> dokter_sp)
    const administeredBy = form.perawat || form.dokter_um || form.dokter_sp;

    if (!administeredBy) {
      alert('Pilih petugas pelaksana (Perawat/Dokter)');
      return;
    }

    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/treatments`, {
        method: 'POST',
        body: JSON.stringify({
          encounter_id: parseInt(encounterId),
          treatment_type: treatmentType,
          treatment_details: treatmentDetails,
          administered_by: administeredBy,
          administered_at: new Date(form.administered_at).toISOString()
        })
      });
      
      if (data.success) {
        // Reset form
        setForm({
          tindakan: null,
          dokter_sp: '',
          dokter_um: '',
          perawat: '',
          tarif: '0',
          potongan: '0',
          jumlah: '1',
          dosis: '',
          rute: '',
          frekuensi: '',
          durasi: '',
          catatan: '',
          administered_at: nowLabel()
        });
        
        fetchTreatmentsHistory();
        alert('Tindakan berhasil ditambahkan');
      } else {
        alert(data.message || 'Gagal menambahkan tindakan');
      }
    } catch (err) {
      console.error('Save treatment error:', err);
      alert('Gagal menyimpan data tindakan');
    }
  };

  // Hapus treatment
  const handleDelete = async (treatmentId) => {
    if (!confirm('Yakin ingin menghapus tindakan ini?')) return;
    
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/treatments/${treatmentId}`, {
        method: 'DELETE'
      });
      
      if (data.success) {
        fetchTreatmentsHistory();
        alert('Tindakan berhasil dihapus');
      } else {
        alert(data.message || 'Gagal menghapus tindakan');
      }
    } catch (err) {
      console.error('Delete treatment error:', err);
      alert('Gagal menghapus tindakan');
    }
  };

  // Format waktu
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Total semua
  const totalAll = treatmentsList.reduce((sum, t) => {
    const subtotal = t.treatment_details?.subtotal || 0;
    return sum + subtotal;
  }, 0);

  // Filter tenaga medis
  const dokterSpList = medicProfilesList.filter(p => p.role === 'dokter_dpjp');
  const perawatList = medicProfilesList.filter(p => p.role === 'perawat');
  // Untuk dokter umum, jika ada role 'dokter_umum'
  const dokterUmList = medicProfilesList.filter(p => p.role === 'dokter_umum');

  // Initial load
  useEffect(() => {
    if (encounterId) {
      fetchTreatmentsHistory();
      fetchMedicProfiles();
    }
  }, [encounterId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">💊 Tindakan Medis & Pemberian Obat</h3>
        <p className="text-xs text-gray-500 mt-1">
          Pencatatan tindakan medis, pemberian obat, dan prosedur lainnya
        </p>
      </div>

      {/* Form Input Tindakan */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Tindakan / Layanan
        </h4>

        {/* Row 1 - Tindakan & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Tindakan/Layanan Medis <span className="text-red-500">*</span></p>
            <TindakanSearch value={form.tindakan} onChange={handleTindakanChange} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Waktu Pemberian</p>
            <input
              type="text"
              value={form.administered_at}
              onChange={(e) => setForm(prev => ({ ...prev, administered_at: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-400 outline-none"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Dosis (untuk Obat)</p>
            <input
              type="text"
              value={form.dosis}
              onChange={(e) => setForm(prev => ({ ...prev, dosis: e.target.value }))}
              placeholder="Contoh: 500mg, 1g, 1000ml"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-400 outline-none"
            />
          </div>
        </div>

        {/* Row 2 - Rute, Frekuensi, Durasi */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Rute Pemberian</p>
            <Select options={RUTE_OBAT} value={form.rute} onChange={(v) => setForm(prev => ({ ...prev, rute: v }))} placeholder="-- Pilih Rute --" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Frekuensi</p>
            <Select options={FREKUENSI_LIST} value={form.frekuensi} onChange={(v) => setForm(prev => ({ ...prev, frekuensi: v }))} placeholder="-- Pilih Frekuensi --" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Durasi</p>
            <input
              type="text"
              value={form.durasi}
              onChange={(e) => setForm(prev => ({ ...prev, durasi: e.target.value }))}
              placeholder="Contoh: 5 hari, 1 minggu"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-400 outline-none"
            />
          </div>
        </div>

        {/* Row 3 - Tenaga Medis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Dokter Spesialis</p>
            <select
              value={form.dokter_sp}
              onChange={(e) => setForm(prev => ({ ...prev, dokter_sp: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-400 outline-none bg-white"
            >
              <option value="">-- Pilih Dokter Spesialis --</option>
              {dokterSpList.map(d => (
                <option key={d.id} value={d.id}>{d.name} {d.specialization && `- ${d.specialization}`}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Dokter Umum</p>
            <select
              value={form.dokter_um}
              onChange={(e) => setForm(prev => ({ ...prev, dokter_um: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-400 outline-none bg-white"
            >
              <option value="">-- Pilih Dokter Umum --</option>
              {dokterUmList.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Perawat Pelaksana</p>
            <select
              value={form.perawat}
              onChange={(e) => setForm(prev => ({ ...prev, perawat: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-400 outline-none bg-white"
            >
              <option value="">-- Pilih Perawat --</option>
              {perawatList.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4 - Tarif, Potongan, Jumlah, Subtotal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Tarif Tindakan</p>
            <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-teal-400">
              <span className="px-3 py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 border-r border-gray-200">Rp</span>
              <input
                type="number"
                min="0"
                value={form.tarif}
                onChange={(e) => setForm(prev => ({ ...prev, tarif: e.target.value }))}
                className="flex-1 px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Potongan</p>
            <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-teal-400">
              <span className="px-3 py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 border-r border-gray-200">Rp</span>
              <input
                type="number"
                min="0"
                value={form.potongan}
                onChange={(e) => setForm(prev => ({ ...prev, potongan: e.target.value }))}
                className="flex-1 px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Jumlah</p>
            <input
              type="number"
              min="1"
              value={form.jumlah}
              onChange={(e) => setForm(prev => ({ ...prev, jumlah: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-400 outline-none"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Subtotal</p>
            <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
              <span className="px-3 py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 border-r border-gray-200">Rp</span>
              <input
                type="text"
                value={subtotal.toLocaleString('id-ID')}
                disabled
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Row 5 - Catatan */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1.5">Catatan / Keterangan</p>
          <textarea
            value={form.catatan}
            onChange={(e) => setForm(prev => ({ ...prev, catatan: e.target.value }))}
            rows={2}
            placeholder="Catatan tambahan tentang tindakan..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-400 outline-none"
          />
        </div>

        {/* Tombol Tambah */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!form.tindakan}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Tindakan
          </button>
        </div>
      </form>

      {/* Riwayat Tindakan */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Riwayat Tindakan ({treatmentsList.length})
          </h4>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Memuat riwayat...</p>
          </div>
        )}

        {!isLoading && treatmentsList.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p className="text-gray-400">Belum ada tindakan medis</p>
            <p className="text-xs text-gray-300 mt-1">Silakan input tindakan pertama di form atas</p>
          </div>
        )}

        {!isLoading && treatmentsList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tindakan / Obat</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Pelaksana</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Tarif</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Potongan</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Jml</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Subtotal</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {treatmentsList.map((treatment, idx) => {
                  const details = treatment.treatment_details;
                  const staff = treatment.administered_by_profile;
                  return (
                    <tr key={treatment.treatment_id} className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500">{formatTime(treatment.administered_at)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{details?.treatment_name}</p>
                        {details?.dosis && <p className="text-xs text-gray-400">Dosis: {details.dosis}</p>}
                        {details?.rute && <p className="text-xs text-gray-400">Rute: {details.rute}</p>}
                        {details?.frekuensi && <p className="text-xs text-gray-400">Frekuensi: {details.frekuensi}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {staff && (
                          <span className="text-xs text-gray-600">
                            {staff.name}<br />
                            <span className="text-gray-400">
                              {staff.role === 'dokter_dpjp' ? 'Dokter Spesialis' : staff.role === 'dokter_umum' ? 'Dokter Umum' : 'Perawat'}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        Rp {parseInt(details?.tarif || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-red-500">
                        {details?.potongan > 0 ? `Rp ${parseInt(details.potongan).toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{details?.jumlah || 1}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-teal-700">
                        Rp {parseInt(details?.subtotal || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(treatment.treatment_id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-teal-50 border-t-2 border-teal-200">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right text-sm font-bold text-teal-700">Total</td>
                  <td className="px-4 py-3 text-right text-sm font-extrabold text-teal-800">
                    Rp {totalAll.toLocaleString('id-ID')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Informasi Singkat */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
        <p className="text-xs text-teal-700">
          <strong className="font-semibold">📋 Jenis Tindakan:</strong><br />
          • 💊 <strong>Pemberian Obat</strong> - Obat oral, IV, IM, SC, Topikal<br />
          • 💉 <strong>Tindakan Medis</strong> - Infus, Kateter, NGT, Suction, Nebulizer, EKG<br />
          • 🩹 <strong>Perawatan</strong> - Perawatan luka, Ganti balutan<br />
          • 🔪 <strong>Tindakan Operasi</strong> - Appendectomy, Caesar, Hernia, dll<br />
          • 📊 <strong>Tarif</strong> - Dapat ditambahkan potongan jika diperlukan
        </p>
      </div>
    </div>
  );
};

export default TreatmentSection;