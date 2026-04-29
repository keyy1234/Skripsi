import React, { useState } from 'react'

// ── Import sub-halaman (aktifkan saat file sudah dibuat) ──────────────
// import RiwayatKonsul    from './konsul/riwayat_konsul'
// import PermintaanKonsul from './konsul/permintaan_konsul'
// import DetailKonsul     from './konsul/detail_konsul'

// ── Default patient ───────────────────────────────────────────────────
const DEFAULT_PATIENT = {
  noRM: '082389', nama: 'IS**N**', noRegistrasi: 'RI072024.0001',
  dpjp: 'Dokter Spesialis 10', jenisPasien: 'Umum',
  ruangan: '[Kelas 1] Adenium 1.D', umur: '86 Thn 0 Bln 26 Hari',
}

// ── Tab config ────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'riwayat_konsul',
    label: 'Riwayat Konsul',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h7',
    component: null, // import RiwayatKonsul
    desc: 'Daftar riwayat permintaan konsul yang pernah dibuat',
  },
  {
    id: 'permintaan_konsul',
    label: 'Permintaan Konsul',
    icon: 'M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    component: null, // import PermintaanKonsul
    desc: 'Buat permintaan konsul baru ke dokter spesialis lain',
    highlight: true,
  },
  {
    id: 'detail_konsul',
    label: 'Detail Konsul',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    component: null, // import DetailKonsul
    desc: 'Lihat detail & jawaban dari konsul yang sudah diproses',
  },
]

// ── Placeholder ───────────────────────────────────────────────────────
const Placeholder = ({ tab }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-6">
    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon}/>
      </svg>
    </div>
    <p className="text-base font-bold text-gray-700 mb-1">{tab.label}</p>
    <p className="text-sm text-gray-400 mb-5 max-w-xs">{tab.desc}</p>
    <code className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-500 font-mono">
      import {tab.label.replace(/\s+/g, '')} from './konsul/{tab.id}'
    </code>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
const Konsul = ({ patient = DEFAULT_PATIENT }) => {
  const [activeTab, setActiveTab] = useState('riwayat_konsul')

  const current    = TABS.find(t => t.id === activeTab)
  const ActivePage = current?.component

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── Tab bar ── */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => {
          const isActive    = activeTab === tab.id
          const isHighlight = tab.highlight

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
              style={{
                borderBottomColor: isActive ? '#f97316' : 'transparent',
                background:
                  isActive
                    ? '#f97316'
                    : isHighlight
                    ? 'transparent'
                    : 'transparent',
                color: isActive ? '#ffffff' : '#6b7280',
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon}/>
              </svg>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Konten ── */}
      {ActivePage
        ? <ActivePage patient={patient}/>
        : <Placeholder tab={current}/>
      }

    </div>
  )
}

export default Konsul