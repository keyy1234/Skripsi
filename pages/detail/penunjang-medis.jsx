import React, { useState } from 'react'

// ── Default patient ───────────────────────────────────────────────────
const DEFAULT_PATIENT = {
  noRM: '082389', nama: 'IS**N**', noRegistrasi: 'RI072024.0001',
  dpjp: 'Dokter Spesialis 10', jenisPasien: 'Umum',
  ruangan: 'Adenium 1.D', umur: '86 Thn 0 Bln 26 Hari',
}

// ── Data contoh ───────────────────────────────────────────────────────
const INIT_LAB = [
  {
    id: 1, noReg: 'LAB072024.0002', tanggal: '27 Juli 2024', jam: '10:26:29',
    status: 'Selesai', pemeriksaan: 'CHOLESTEROL TOTAL',
    hasil: [
      { nama: 'Cholesterol Total', nilai: '198', satuan: 'mg/dL', rujukan: '< 200', flag: 'normal' },
    ],
  },
  {
    id: 2, noReg: 'LAB072024.0003', tanggal: '27 Juli 2024', jam: '10:58:13',
    status: 'Selesai', pemeriksaan: 'CHOLESTEROL TOTAL, GLUKOSA PUASA',
    hasil: [
      { nama: 'Cholesterol Total', nilai: '210', satuan: 'mg/dL', rujukan: '< 200', flag: 'tinggi' },
      { nama: 'Glukosa Puasa',     nilai: '126', satuan: 'mg/dL', rujukan: '70 - 100', flag: 'tinggi' },
    ],
  },
  {
    id: 3, noReg: 'LAB072024.0004', tanggal: '28 Juli 2024', jam: '08:15:00',
    status: 'Permintaan', pemeriksaan: 'DARAH LENGKAP',
    hasil: [],
  },
]

const INIT_RADIOLOGI = [
  {
    id: 1, noReg: 'RAD072024.0001', tanggal: '27 Juli 2024', jam: '11:30:00',
    status: 'Selesai', pemeriksaan: 'Foto Thorax PA',
    hasil: [
      { nama: 'Kesan', nilai: 'Cor dan pulmo dalam batas normal. Tidak tampak infiltrat.', satuan: '', rujukan: '', flag: 'normal' },
    ],
  },
]

const INIT_PATOLOGI = []

// ── Status badge ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    'Selesai':     { bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-500'   },
    'Permintaan':  { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
    'Proses':      { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
    'Dibatalkan':  { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-400'    },
  }
  const s = map[status] ?? map['Permintaan']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
      {status}
    </span>
  )
}

// ── Flag badge ────────────────────────────────────────────────────────
const FlagBadge = ({ flag }) => {
  if (flag === 'normal') return <span className="text-xs text-gray-400">Normal</span>
  if (flag === 'tinggi') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-600">▲ Tinggi</span>
  if (flag === 'rendah') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-600">▼ Rendah</span>
  return null
}

// ── Modal Hasil ───────────────────────────────────────────────────────
const ModalHasil = ({ item, onClose, jenis }) => {
  if (!item) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              Hasil {jenis}
            </p>
            <h3 className="text-base font-bold text-gray-900">{item.pemeriksaan}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {item.noReg} &nbsp;·&nbsp; {item.tanggal} {item.jam}
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {item.hasil.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Hasil belum tersedia — masih dalam proses
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Pemeriksaan</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Nilai</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Satuan</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Nilai Rujukan</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Flag</th>
                </tr>
              </thead>
              <tbody>
                {item.hasil.map((h, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${h.flag === 'tinggi' || h.flag === 'rendah' ? 'bg-red-50/40' : ''}`}>
                    <td className="py-3 px-3 text-gray-800 font-medium">{h.nama}</td>
                    <td className={`py-3 px-3 text-right font-bold ${h.flag === 'tinggi' ? 'text-red-600' : h.flag === 'rendah' ? 'text-blue-600' : 'text-gray-900'}`}>
                      {h.nilai}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-500">{h.satuan || '—'}</td>
                    <td className="py-3 px-3 text-center text-gray-500">{h.rujukan || '—'}</td>
                    <td className="py-3 px-3 text-center"><FlagBadge flag={h.flag}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            Tutup
          </button>
          {item.hasil.length > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Cetak Hasil
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Tabel Pemeriksaan ─────────────────────────────────────────────────
const TabelPemeriksaan = ({ data, onLihatHasil, jenis }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">No. Reg</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Tanggal</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status Layanan</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Pemeriksaan</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                Pasien tidak melakukan pemeriksaan {jenis.toLowerCase()}
              </td>
            </tr>
          ) : data.map(row => (
            <tr key={row.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-mono text-xs text-teal-700 font-semibold whitespace-nowrap">{row.noReg}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="text-sm text-gray-700">{row.tanggal}</p>
                <p className="text-xs text-gray-400">{row.jam}</p>
              </td>
              <td className="px-4 py-3"><StatusBadge status={row.status}/></td>
              <td className="px-4 py-3 text-sm text-gray-800 max-w-[220px]">{row.pemeriksaan}</td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onLihatHasil(row)}
                  disabled={row.status === 'Permintaan'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition
                    ${row.status === 'Permintaan'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                    }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  {row.status === 'Permintaan' ? 'Menunggu' : 'Hasil'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

// ── Section Header ────────────────────────────────────────────────────
const SectionHeader = ({ title, count }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</p>
      {count > 0 && (
        <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">{count}</span>
      )}
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
const PenunjangMedis = ({ patient = DEFAULT_PATIENT }) => {
  const [labData]       = useState(INIT_LAB)
  const [radioData]     = useState(INIT_RADIOLOGI)
  const [patologiData]  = useState(INIT_PATOLOGI)

  const [modalItem, setModalItem]   = useState(null)
  const [modalJenis, setModalJenis] = useState('')

  const openHasil = (item, jenis) => { setModalItem(item); setModalJenis(jenis) }
  const closeHasil = () => { setModalItem(null); setModalJenis('') }

  return (
    <div className="p-6 space-y-8">

      {/* ── LABORATORIUM ── */}
      <div>
        <SectionHeader title="Pemeriksaan Laboratorium" count={labData.filter(d => d.status === 'Selesai').length}/>
        <TabelPemeriksaan
          data={labData}
          jenis="Laboratorium"
          onLihatHasil={item => openHasil(item, 'Laboratorium')}
        />
      </div>

      {/* ── RADIOLOGI ── */}
      <div>
        <SectionHeader title="Pemeriksaan Radiologi" count={radioData.filter(d => d.status === 'Selesai').length}/>
        <TabelPemeriksaan
          data={radioData}
          jenis="Radiologi"
          onLihatHasil={item => openHasil(item, 'Radiologi')}
        />
      </div>

      {/* ── PATOLOGI ANATOMI ── */}
      <div>
        <SectionHeader title="Hasil Pemeriksaan Patologi Anatomi" count={patologiData.filter(d => d.status === 'Selesai').length}/>
        <TabelPemeriksaan
          data={patologiData}
          jenis="Patologi Anatomi"
          onLihatHasil={item => openHasil(item, 'Patologi Anatomi')}
        />
      </div>

      {/* ── Modal Hasil ── */}
      <ModalHasil item={modalItem} jenis={modalJenis} onClose={closeHasil}/>

    </div>
  )
}

export default PenunjangMedis