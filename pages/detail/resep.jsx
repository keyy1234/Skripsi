import React, { useState } from 'react'

// ── Default patient ───────────────────────────────────────────────────
const DEFAULT_PATIENT = {
  noRM: '082389', nama: 'IS**N**', noRegistrasi: 'RI072024.0001',
  dpjp: 'Dokter Spesialis 10', jenisPasien: 'Umum', ruangan: 'Adenium 1.D',
}

// ── Data contoh ───────────────────────────────────────────────────────
const INIT_RESEP = [
  {
    id: 1,
    noResep: '#RSP072024.00002',
    tanggal: '27 Juli 2024 10:26:29',
    status: 'Permintaan',
    dokter: 'Dokter Spesialis 10',
    jenisResep: 'Racikan',
    items: [
      {
        id: 1, nama: 'Amoxicillin 500mg', jumlah: 10, satuan: 'Kapsul',
        aturan: '3x1', waktu: 'Sesudah Makan', rute: 'Oral', catatan: '',
      },
      {
        id: 2, nama: 'Paracetamol 500mg', jumlah: 15, satuan: 'Tablet',
        aturan: '3x1', waktu: 'Jika Perlu', rute: 'Oral', catatan: 'Jika demam > 38°C',
      },
    ],
  },
  {
    id: 2,
    noResep: '#RSP072024.00005',
    tanggal: '28 Juli 2024 08:45:10',
    status: 'Selesai',
    dokter: 'Dokter Spesialis 10',
    jenisResep: 'Non-Racikan',
    items: [
      {
        id: 1, nama: 'Omeprazole 20mg', jumlah: 7, satuan: 'Kapsul',
        aturan: '1x1', waktu: 'Sebelum Makan', rute: 'Oral', catatan: '',
      },
      {
        id: 2, nama: 'Metformin 500mg', jumlah: 14, satuan: 'Tablet',
        aturan: '2x1', waktu: 'Sesudah Makan', rute: 'Oral', catatan: '',
      },
      {
        id: 3, nama: 'NaCl 0.9% 500ml', jumlah: 2, satuan: 'Botol',
        aturan: '2x1', waktu: '-', rute: 'Intravena', catatan: 'Drip 20 tpm',
      },
    ],
  },
  {
    id: 3,
    noResep: '#RSP072024.00008',
    tanggal: '29 Juli 2024 14:10:00',
    status: 'Proses',
    dokter: 'Dokter Spesialis 10',
    jenisResep: 'Racikan',
    items: [],
  },
]

// ── Status badge ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    'Selesai':    { bg: 'bg-teal-100',  text: 'text-teal-700',  dot: 'bg-teal-500'  },
    'Permintaan': { bg: 'bg-blue-100',  text: 'text-blue-700',  dot: 'bg-blue-500'  },
    'Proses':     { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    'Dibatalkan': { bg: 'bg-red-100',   text: 'text-red-700',   dot: 'bg-red-400'   },
  }
  const s = map[status] ?? map['Permintaan']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
      {status}
    </span>
  )
}

// ── Modal Detail Resep ────────────────────────────────────────────────
const ModalDetailResep = ({ resep, onClose }) => {
  if (!resep) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between"
          style={{ background: 'linear-gradient(90deg,#0d9488,#14b8a6)' }}>
          <div>
            <p className="text-xs font-semibold text-teal-100 uppercase tracking-wide mb-0.5">Detail Resep</p>
            <h3 className="text-base font-bold text-white">{resep.noResep}</h3>
            <p className="text-sm text-teal-100 mt-0.5">{resep.tanggal} &nbsp;·&nbsp; {resep.dokter}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
              {resep.jenisResep}
            </span>
            <button onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600">Status:</p>
            <StatusBadge status={resep.status}/>
          </div>
          <p className="text-sm text-gray-500">
            {resep.items.length} item obat
          </p>
        </div>

        {/* Body — tabel obat */}
        <div className="px-6 py-4">
          {resep.items.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Detail obat belum tersedia
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">No</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Obat</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jumlah</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aturan Pakai</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rute</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resep.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-3 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-gray-800">{item.nama}</p>
                        <p className="text-xs text-gray-400">{item.satuan}</p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-gray-800">{item.jumlah}</span>
                        <span className="text-xs text-gray-400 ml-1">{item.satuan}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <p className="font-semibold text-teal-700">{item.aturan}</p>
                        <p className="text-xs text-gray-400">{item.waktu}</p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.rute === 'Intravena'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.rute}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-500">
                        {item.catatan || <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            Tutup
          </button>
          {resep.items.length > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Cetak Resep
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
const ResepDetail = ({ patient = DEFAULT_PATIENT }) => {
  const [resepList]   = useState(INIT_RESEP)
  const [modalResep, setModalResep] = useState(null)

  return (
    <div className="p-6">

      {/* Tabel resep */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">No. Resep</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Tanggal</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jenis</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dokter</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resepList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-sm text-gray-400">
                  Belum ada resep untuk pasien ini
                </td>
              </tr>
            ) : resepList.map(resep => (
              <tr key={resep.id} className="hover:bg-gray-50 transition group">
                <td className="py-3.5 px-4">
                  <span className="font-mono text-sm font-bold text-teal-700">{resep.noResep}</span>
                </td>
                <td className="py-3.5 px-4 text-sm text-gray-700 whitespace-nowrap">{resep.tanggal}</td>
                <td className="py-3.5 px-4"><StatusBadge status={resep.status}/></td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    resep.jenisResep === 'Racikan'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {resep.jenisResep}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-sm text-gray-700">{resep.dokter}</td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => setModalResep(resep)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Detail Resep
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <ModalDetailResep resep={modalResep} onClose={() => setModalResep(null)}/>
    </div>
  )
}

export default ResepDetail