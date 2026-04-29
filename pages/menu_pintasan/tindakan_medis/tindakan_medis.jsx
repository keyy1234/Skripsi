import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// ── Data ──────────────────────────────────────────────────────────────
const DEFAULT_PATIENT = {
  noRM: '901262678', 
  nama: 'Bagus Sudarmono', 
  noRegistrasi: 'RI202604077485',
  dpjp: 'dr. Andi Saputra, Sp.B', 
  jenisPasien: 'Umum',
  ruangan: 'Kamar Mawar 2 - TT-03', 
  umur: '30 Thn',
  dikirimOleh: 'Praktek Dokter', 
  tanggalMasuk: '07 April 2026, 00:28', 
  tanggalKeluar: '-',
}

// ── Komponen PatientInfoCard (SAMA PERSIS dengan AsesMenMedis) ─────────
const PatientInfoCard = ({ patient }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)' }} />
      <div className="px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">{patient.nama}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1.5 text-sm">
          <p><span className="text-gray-500">No. Registrasi: </span><span className="font-medium">{patient.noRegistrasi}</span></p>
          <p><span className="text-gray-500">Dikirim Oleh: </span><span className="font-medium">{patient.dikirimOleh}</span></p>
          <p><span className="text-gray-500">DPJP: </span><span className="font-medium">{patient.dpjp}</span></p>
          <p><span className="text-gray-500">Tanggal Masuk: </span><span className="font-medium">{patient.tanggalMasuk}</span></p>
          <p><span className="text-gray-500">Jenis Pasien: </span><span className="font-medium">{patient.jenisPasien}</span></p>
          <p><span className="text-gray-500">Tanggal Keluar: </span><span className="font-medium">{patient.tanggalKeluar}</span></p>
          <p><span className="text-gray-500">Umur: </span><span className="font-medium">{patient.umur}</span></p>
        </div>
      </div>
    </div>
  )
}

const TINDAKAN_LIST = [
  { kode: 'T001', nama: 'Visite Dokter Spesialis',    tarif: 150000 },
  { kode: 'T002', nama: 'Visite Dokter Umum',          tarif: 75000  },
  { kode: 'T003', nama: 'Pemasangan Infus',             tarif: 50000  },
  { kode: 'T004', nama: 'Pemasangan Kateter',           tarif: 75000  },
  { kode: 'T005', nama: 'Injeksi Intravena',            tarif: 35000  },
  { kode: 'T006', nama: 'Injeksi Intramuskular',        tarif: 25000  },
  { kode: 'T007', nama: 'Pengambilan Darah Vena',       tarif: 30000  },
  { kode: 'T008', nama: 'Pemasangan NGT',               tarif: 100000 },
  { kode: 'T009', nama: 'Nebulisasi',                   tarif: 60000  },
  { kode: 'T010', nama: 'Perawatan Luka Kecil',         tarif: 80000  },
  { kode: 'T011', nama: 'Perawatan Luka Sedang',        tarif: 150000 },
  { kode: 'T012', nama: 'Perawatan Luka Besar',         tarif: 250000 },
  { kode: 'T013', nama: 'Suction',                      tarif: 45000  },
  { kode: 'T014', nama: 'Transfusi Darah',              tarif: 200000 },
  { kode: 'T015', nama: 'EKG / Elektrokardiogram',      tarif: 120000 },
  { kode: 'T016', nama: 'Fisioterapi',                  tarif: 175000 },
  { kode: 'T017', nama: 'Oksigenasi Nasal Kanul',       tarif: 40000  },
  { kode: 'T018', nama: 'Oksigenasi Masker',            tarif: 55000  },
  { kode: 'T019', nama: 'Pemantauan Saturasi',          tarif: 25000  },
  { kode: 'T020', nama: 'Tindakan Resusitasi',          tarif: 500000 },

  // ========== TINDAKAN OPERASI / BEDAH ==========
  { kode: 'T021', nama: 'Operasi Appendectomy (Usus Buntu)', tarif: 5000000 },
  { kode: 'T022', nama: 'Operasi Caesar (SC)', tarif: 7500000 },
  { kode: 'T023', nama: 'Operasi Hernia', tarif: 4000000 },
  { kode: 'T024', nama: 'Operasi Batu Empedu', tarif: 6000000 },
  { kode: 'T025', nama: 'Operasi Tumor / Mastektomi', tarif: 8000000 },
  { kode: 'T026', nama: 'Operasi Katarak (Fakoemulsifikasi)', tarif: 3500000 },
  { kode: 'T027', nama: 'Operasi Tonsilektomi (Amandel)', tarif: 2500000 },
  { kode: 'T028', nama: 'Operasi Fraktur (Pemasangan Pen)', tarif: 5500000 },
  { kode: 'T029', nama: 'Operasi Laparoskopi', tarif: 7000000 },
  { kode: 'T030', nama: 'Operasi Histerektomi', tarif: 6500000 },
  { kode: 'T031', nama: 'Operasi Prostatektomi', tarif: 6000000 },
  { kode: 'T032', nama: 'Operasi Hemoroid (Wasir)', tarif: 3000000 },
  { kode: 'T033', nama: 'Operasi Batu Ginjal (PCNL)', tarif: 8500000 },
  
  // ========== TINDAKAN RADIOLOGI ==========
  { kode: 'R001', nama: 'Rontgen Thorax (Dada)', tarif: 150000 },
  { kode: 'R002', nama: 'Rontgen Ekstremitas (Tangan/Kaki)', tarif: 120000 },
  { kode: 'R003', nama: 'CT-Scan Kepala', tarif: 1200000 },
  { kode: 'R004', nama: 'CT-Scan Abdomen', tarif: 1500000 },
  { kode: 'R005', nama: 'MRI Kepala', tarif: 2500000 },
  { kode: 'R006', nama: 'MRI Lumbal', tarif: 2800000 },
  { kode: 'R007', nama: 'USG Abdomen', tarif: 250000 },
  { kode: 'R008', nama: 'USG Obstetrik (Kehamilan)', tarif: 200000 },
  { kode: 'R009', nama: 'USG Payudara (Mamografi)', tarif: 350000 },
  { kode: 'R010', nama: 'Echocardiography (Echo Jantung)', tarif: 500000 },
  
  // ========== TINDAKAN GIGI ==========
  { kode: 'G001', nama: 'Cabut Gigi (Eksisi)', tarif: 100000 },
  { kode: 'G002', nama: 'Tambal Gigi (Restorasi)', tarif: 150000 },
  { kode: 'G003', nama: 'Scaling (Pembersihan Karang Gigi)', tarif: 200000 },
  { kode: 'G004', nama: 'Pemasangan Behel (Ortodonsi)', tarif: 3000000 },
  { kode: 'G005', nama: 'Perawatan Saluran Akar (Root Canal)', tarif: 500000 },
  
  // ========== TINDAKAN LAINNYA ==========
  { kode: 'L001', nama: 'Konsultasi Gizi', tarif: 75000 },
  { kode: 'L002', nama: 'Konsultasi Psikologi', tarif: 125000 },
  { kode: 'L003', nama: 'Edukasi Pasien (Penyuluhan Kesehatan)', tarif: 50000 },
  { kode: 'L004', nama: 'Vaksinasi (Imunisasi)', tarif: 100000 },
  { kode: 'L005', nama: 'Fototerapi (Bayi Kuning)', tarif: 150000 },
  { kode: 'L006', nama: 'Inkubator (Perawatan Bayi)', tarif: 250000 },
];

const DOKTER_SPESIALIS = ['Silakan Pilih', 'Dr. Budi Santoso, Sp.PD', 'Dr. Sarah Putri, Sp.OG', 'Dr. Ahmad Fauzi, Sp.A', 'Dr. Rina Wijaya, Sp.B', 'Dr. Hendra Lim, Sp.JP']
const DOKTER_UMUM      = ['Silakan Pilih', 'Dr. Ucok Sofyan', 'Dr. Dewi Kartika', 'Dr. Reza Pratama', 'Dr. Siti Aminah']
const PARAMEDIS_LIST   = ['Silakan Pilih', 'Ns. Ani Rahayu', 'Ns. Budi Setiawan', 'Ns. Clara Putri', 'Bdn. Dewi Sari', 'Ns. Erik Mahendra']

const nowLabel = () => {
  const d   = new Date()
  const bln = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const hh  = String(d.getHours()).padStart(2,'0')
  const mm  = String(d.getMinutes()).padStart(2,'0')
  const ss  = String(d.getSeconds()).padStart(2,'0')
  return `${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()} ${hh}:${mm}:${ss}`
}

// ── Tindakan Search Dropdown ──────────────────────────────────────────
const TindakanSearch = ({ value, onChange }) => {
  const [q, setQ]       = useState('')
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const results = q.length >= 1
    ? TINDAKAN_LIST.filter(t =>
        t.nama.toLowerCase().includes(q.toLowerCase()) ||
        t.kode.toLowerCase().includes(q.toLowerCase()))
    : TINDAKAN_LIST

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">
        <svg className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          value={value ? value.nama : q}
          onChange={e => { setQ(e.target.value); setOpen(true); if (value) onChange(null) }}
          onFocus={() => setOpen(true)}
          placeholder="Cari Tindakan Medis Rawat Inap"
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-gray-700"
        />
        {value
          ? <button onClick={() => { onChange(null); setQ('') }} className="px-3 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          : <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
        }
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {results.length === 0
            ? <div className="px-4 py-4 text-sm text-gray-400 text-center">Tidak ditemukan</div>
            : results.map(item => (
              <button key={item.kode}
                onClick={() => { onChange(item); setOpen(false); setQ('') }}
                className="w-full text-left px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-teal-500 hover:text-white group transition-colors flex items-center justify-between">
                <span className="text-sm text-gray-800 group-hover:text-white">{item.nama}</span>
                <span className="text-xs text-gray-400 group-hover:text-teal-100 ml-4 whitespace-nowrap">
                  Rp {item.tarif.toLocaleString('id-ID')}
                </span>
              </button>
            ))
          }
        </div>
      )}
    </div>
  )
}

// ── Reusable select ───────────────────────────────────────────────────
const Sel = ({ options, value, onChange }) => (
  <div className="relative">
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-700">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
    </svg>
  </div>
)

// ── Rp field ──────────────────────────────────────────────────────────
const RpField = ({ value, onChange, disabled = false }) => (
  <div className={`flex items-center border rounded-lg overflow-hidden ${disabled ? 'bg-gray-50 border-gray-200' : 'border-gray-300 bg-white focus-within:ring-1 focus-within:ring-teal-500'}`}>
    <span className="px-3 py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 border-r border-gray-200 select-none">Rp.</span>
    <input
      type={disabled ? 'text' : 'number'}
      min="0"
      value={value}
      onChange={e => !disabled && onChange(e.target.value)}
      disabled={disabled}
      className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-gray-800"
    />
  </div>
)

const Lbl = ({ children }) => <p className="text-sm font-semibold text-gray-700 mb-1.5">{children}</p>

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
const EMPTY_FORM = {
  tindakan:  null,
  dokterSp:  'Silakan Pilih',
  dokterUm:  'Silakan Pilih',
  paramedis: 'Silakan Pilih',
  tarif:     '0',
  potongan:  '0',
  jumlah:    '1',
  waktu:     '',
}

const Tindakan_medis = ({ patient: propPatient }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Gunakan data dari props jika ada, fallback ke DEFAULT_PATIENT
  const patient = propPatient || location.state?.patient || DEFAULT_PATIENT;
  
  const [form, setForm] = useState({ ...EMPTY_FORM, waktu: nowLabel() })
  const [list, setList] = useState([])

  const tarif    = parseFloat(form.tarif)    || 0
  const potongan = parseFloat(form.potongan) || 0
  const jumlah   = parseFloat(form.jumlah)   || 1
  const subtotal = Math.max(0, (tarif - potongan) * jumlah)

  const handleTindakan = item => {
    setForm(f => ({ ...f, tindakan: item, tarif: item ? String(item.tarif) : '0', potongan: '0' }))
  }

  const handleTambah = () => {
    if (!form.tindakan) return
    setList(l => [...l, {
      id:        Date.now(),
      waktu:     form.waktu,
      tindakan:  form.tindakan,
      dokterSp:  form.dokterSp  === 'Silakan Pilih' ? '-' : form.dokterSp,
      dokterUm:  form.dokterUm  === 'Silakan Pilih' ? '-' : form.dokterUm,
      paramedis: form.paramedis === 'Silakan Pilih' ? '-' : form.paramedis,
      tarif, potongan, jumlah, subtotal,
    }])
    setForm({ ...EMPTY_FORM, waktu: nowLabel() })
  }

  const totalAll = list.reduce((s, r) => s + r.subtotal, 0)

  const handleSave = () => {
    if (list.length === 0) {
      alert('Tidak ada tindakan yang disimpan');
      return;
    }
    console.log('Data tindakan disimpan:', { patient, tindakan: list, total: totalAll });
    alert(`Berhasil menyimpan ${list.length} tindakan. Total: Rp ${totalAll.toLocaleString('id-ID')}`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6 space-y-5">
        
        {/* Patient Info Card - SAMA PERSIS dengan AsesMenMedis */}
        <PatientInfoCard patient={patient} />

        {/* Header Halaman */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Tindakan & Layanan Medis
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Catat tindakan medis yang dilakukan kepada pasien</p>
          </div>
          
          {/* Ringkasan Total */}
          {list.length > 0 && (
            <div className="bg-teal-50 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-500">Total Tindakan</div>
              <div className="text-lg font-bold text-teal-600">Rp {totalAll.toLocaleString('id-ID')}</div>
            </div>
          )}
        </div>

        {/* Form Tindakan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)' }} />
          <div className="p-6 space-y-5">

            {/* Row 1 — 4 kolom */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Lbl>Tindakan/Layanan Medis</Lbl>
                <TindakanSearch value={form.tindakan} onChange={handleTindakan} />
              </div>
              <div>
                <Lbl>Dokter Spesialis</Lbl>
                <Sel options={DOKTER_SPESIALIS} value={form.dokterSp} onChange={v => setForm(f => ({ ...f, dokterSp: v }))} />
              </div>
              <div>
                <Lbl>Dokter Umum</Lbl>
                <Sel options={DOKTER_UMUM} value={form.dokterUm} onChange={v => setForm(f => ({ ...f, dokterUm: v }))} />
              </div>
              <div>
                <Lbl>Paramedis</Lbl>
                <Sel options={PARAMEDIS_LIST} value={form.paramedis} onChange={v => setForm(f => ({ ...f, paramedis: v }))} />
              </div>
            </div>

            {/* Row 2 — Tarif Potongan Jumlah Subtotal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Lbl>Tarif Tindakan</Lbl>
                <RpField value={form.tarif} onChange={v => setForm(f => ({ ...f, tarif: v }))} />
              </div>
              <div>
                <Lbl>Potongan</Lbl>
                <RpField value={form.potongan} onChange={v => setForm(f => ({ ...f, potongan: v }))} />
              </div>
              <div>
                <Lbl>Jumlah</Lbl>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">
                  <input type="number" min="1" value={form.jumlah}
                    onChange={e => setForm(f => ({ ...f, jumlah: e.target.value }))}
                    className="flex-1 px-3 py-2.5 text-sm outline-none" />
                </div>
              </div>
              <div>
                <Lbl>Subtotal</Lbl>
                <RpField value={subtotal.toLocaleString('id-ID')} onChange={() => {}} disabled />
              </div>
            </div>

            {/* Row 3 — Waktu */}
            <div>
              <Lbl>Waktu Pemberian</Lbl>
              <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-teal-500 w-80">
                <input type="text" value={form.waktu}
                  onChange={e => setForm(f => ({ ...f, waktu: e.target.value }))}
                  className="flex-1 px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>

            {/* Tombol Tambah */}
            <div>
              <button onClick={handleTambah} disabled={!form.tindakan}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Tambah Tindakan
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Daftar Tindakan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)' }} />
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">📋 Daftar Tindakan yang Akan Disimpan</h3>
          </div>
          
          {list.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Belum ada tindakan</p>
              <p className="text-sm mt-1">Pilih tindakan dari form di atas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Waktu & Tindakan</th>
                    <th className="px-4 py-3 text-left">Dokter Spesialis</th>
                    <th className="px-4 py-3 text-left">Dokter Umum</th>
                    <th className="px-4 py-3 text-left">Paramedis</th>
                    <th className="px-4 py-3 text-right">Tarif</th>
                    <th className="px-4 py-3 text-right">Potongan</th>
                    <th className="px-4 py-3 text-center">Jumlah</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row, idx) => (
                    <tr key={row.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-800">{row.tindakan.nama}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{row.waktu}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{row.dokterSp}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{row.dokterUm}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{row.paramedis}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right whitespace-nowrap">Rp {row.tarif.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        {row.potongan > 0
                          ? <span className="text-red-500">Rp {row.potongan.toLocaleString('id-ID')}</span>
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-center">{row.jumlah}</td>
                      <td className="px-4 py-3 text-sm font-bold text-teal-700 text-right whitespace-nowrap">
                        Rp {row.subtotal.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setList(l => l.filter(x => x.id !== row.id))}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-teal-50 border-t-2 border-teal-200">
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-sm font-bold text-teal-700 text-right">Total</td>
                    <td className="px-4 py-3 text-sm font-extrabold text-teal-700 text-right whitespace-nowrap">
                      Rp {totalAll.toLocaleString('id-ID')}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Tombol Simpan */}
        {list.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Simpan Semua Tindakan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tindakan_medis