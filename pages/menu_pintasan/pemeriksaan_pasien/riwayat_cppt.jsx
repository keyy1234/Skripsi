import React, { useState } from 'react'

// ── Default patient ───────────────────────────────────────────────────

// ── Sample data ───────────────────────────────────────────────────────
const CPPT_DATA = [
  {
    id: 1,
    tanggal: '27 Juli 2024', jam: '11:08:10',
    subjective: 'ps sakit perut, mual dan muntah',
    objective: ['KU: "Baik"', 'GCS: "Compos Mentis"', 'Nadi: 75 bpm', 'TD: 120/70 mmHg', 'Suhu: 36°C', 'RR: 40x/menit', 'SpO2: 90.00%'],
    assesment: 'Diagnosa Utama: [A01] TYPHOID AND PARATYPHOID FEVERS\n--demam',
    planning: 'Rawat inap, infus RL 20 tpm\nMonitoring TTV tiap 4 jam',
    instruksiPPA: 'instruksi DPJP',
    perawat: 'Perawat', verifikasi: false,
  },
  {
    id: 2,
    tanggal: '27 Juli 2024', jam: '10:54:24',
    subjective: 'ps sakit perut, mual dan muntah\nRiw. Hipertensi',
    objective: ['KU: "Lemah"', 'GCS: "Compos Mentis"', 'Nadi: 88 bpm', 'TD: 130/85 mmHg', 'Suhu: 37.2°C', 'RR: 22x/menit', 'SpO2: 97.00%'],
    assesment: 'Nyeri abdomen, hipertensi tidak terkontrol',
    planning: 'Konsul SpPD, observasi ketat',
    instruksiPPA: 'Konsul dr. SpPD',
    perawat: 'Bidan', verifikasi: true,
  },
]

// ── QR placeholder ────────────────────────────────────────────────────
const QRCode = () => (
  <div className="w-16 h-16 bg-white border border-gray-300 rounded flex items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 21 21" className="w-14 h-14">
      <rect x="1" y="1" width="7" height="7" fill="none" stroke="#222" strokeWidth="1"/>
      <rect x="2" y="2" width="5" height="5" fill="#222"/>
      <rect x="13" y="1" width="7" height="7" fill="none" stroke="#222" strokeWidth="1"/>
      <rect x="14" y="2" width="5" height="5" fill="#222"/>
      <rect x="1" y="13" width="7" height="7" fill="none" stroke="#222" strokeWidth="1"/>
      <rect x="2" y="14" width="5" height="5" fill="#222"/>
      <rect x="9" y="1" width="2" height="2" fill="#222"/><rect x="11" y="1" width="2" height="2" fill="#222"/>
      <rect x="9" y="3" width="2" height="2" fill="#222"/><rect x="13" y="9" width="2" height="2" fill="#222"/>
      <rect x="15" y="9" width="2" height="2" fill="#222"/><rect x="9" y="9" width="2" height="2" fill="#222"/>
      <rect x="11" y="11" width="2" height="2" fill="#222"/><rect x="9" y="13" width="2" height="2" fill="#222"/>
      <rect x="11" y="15" width="2" height="2" fill="#222"/><rect x="13" y="13" width="2" height="2" fill="#222"/>
      <rect x="15" y="15" width="2" height="2" fill="#222"/><rect x="17" y="13" width="2" height="2" fill="#222"/>
    </svg>
  </div>
)

// ── Salin button ──────────────────────────────────────────────────────
const SalinBtn = ({ text }) => {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text || ''); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs font-medium text-gray-600 rounded hover:bg-gray-50 transition mt-2"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      {copied ? 'Tersalin!' : 'Salin'}
    </button>
  )
}



// ── Main Page ─────────────────────────────────────────────────────────
const RiwayatCPPT = ({ patient = DEFAULT_PATIENT }) => {
  const [search, setSearch] = useState('')
  const [perPage, setPerPage] = useState(10)

  const filtered = CPPT_DATA.filter(r =>
    r.subjective.toLowerCase().includes(search.toLowerCase()) ||
    r.tanggal.includes(search)
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6">
        

        {/* Page title + toolbar */}
        <div className="flex items-center justify-between mb-4">
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-44"
            />
            <button className="px-4 py-1.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat CPPT
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid border-b-2 border-red-400" style={{ gridTemplateColumns: '160px 1fr 200px 130px 180px' }}>
            {['Tanggal', 'SOAP', 'Instruksi PPA', 'PPA', 'Verifikasi DPJP'].map(h => (
              <div key={h} className="px-5 py-3 text-sm font-semibold text-gray-700">{h}</div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">Tidak ada data CPPT</div>
          ) : (
            filtered.map((row, idx) => (
              <div
                key={row.id}
                className={`grid border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                style={{ gridTemplateColumns: '160px 1fr 200px 130px 180px' }}
              >
                {/* Tanggal */}
                <div className="px-4 py-4 border-r border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{row.tanggal}</p>
                  <p className="text-xs text-gray-400 mb-3">{row.jam}</p>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 text-xs font-medium text-gray-600 rounded hover:bg-gray-50 transition w-full justify-center mb-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Salin Semua
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 text-xs font-medium text-gray-600 rounded hover:bg-gray-50 transition w-full justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    SBAR
                  </button>
                </div>

                {/* SOAP */}
                <div className="px-5 py-4 border-r border-gray-100 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-800 underline">Subjective:</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{row.subjective}</p>
                    <SalinBtn text={row.subjective} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 underline">Objective:</p>
                    <div className="mt-1 space-y-0.5">
                      {row.objective.map((line, i) => <p key={i} className="text-sm text-gray-700">{line}</p>)}
                    </div>
                    <SalinBtn text={row.objective.join('\n')} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 underline">Assesment:</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{row.assesment}</p>
                    <SalinBtn text={row.assesment} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 underline">Planning:</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{row.planning}</p>
                    <SalinBtn text={row.planning} />
                  </div>
                </div>

                {/* Instruksi PPA */}
                <div className="px-4 py-4 border-r border-gray-100">
                  <p className="text-sm text-gray-700">{row.instruksiPPA}</p>
                  <SalinBtn text={row.instruksiPPA} />
                </div>

                {/* PPA */}
                <div className="px-4 py-4 border-r border-gray-100 flex flex-col items-center gap-2">
                  <QRCode />
                  <p className="text-xs font-semibold text-gray-700">{row.perawat}</p>
                  <div className="flex gap-1.5 mt-1">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Verifikasi */}
                <div className="px-4 py-4 flex items-start justify-center pt-5">
                  {row.verifikasi ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Sudah Diverifikasi
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded text-xs font-bold bg-orange-500 text-white">
                      Belum Diverifikasi
                    </span>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 px-5 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Showing 1 to {filtered.length} of {filtered.length} rows</span>
            <div className="flex items-center gap-1.5">
              <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}
                className="px-2 py-1 text-sm font-semibold bg-blue-500 text-white rounded border-0 outline-none cursor-pointer">
                {[10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <span className="text-sm text-gray-500">rows per page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiwayatCPPT