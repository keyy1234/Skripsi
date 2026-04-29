import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// ── Import sub-halaman (aktifkan saat file sudah dibuat) ──────────────
// import Kunjungan            from './detail/kunjungan'
// import GiziPasien           from './detail/gizi_pasien'
// import Diagnosa             from './detail/diagnosa'
// import ICD9                 from './detail/icd9'
import PenunjangMedis from './penunjang-medis';
// import Tindakan             from './detail/tindakan'
import ResepDetail             from './resep'
// import CPPT                 from './detail/cppt'
// import ResumeMedis          from './detail/resume_medis'
// import RingkasanMasukKeluar from './detail/ringkasan_masuk_keluar'
// import Ruangan              from './detail/ruangan'
// import DataSIRS             from './detail/data_sirs'

// ── Default patient fallback ──────────────────────────────────────────
const DEFAULT_PATIENT = {
  id: 1, noRegistrasi: 'RI072024.0001', nama: 'IS**N**', noRM: '082389',
  jenisPasien: 'Umum', bpjs: null, dpjp: 'Dokter Spesialis 10', spesialis: 'Bedah',
  kamar: '[Kelas 1] Adenium 1.D - TT. No. 2', masuk: '27 Jul 2024 10:09:37',
  keluar: null, status: 'dirawat',
}

// ── Menu sidebar ──────────────────────────────────────────────────────
const MENU = [
  {
    id: 'kunjungan',
    label: 'Kunjungan',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    component: null,
    desc: 'Riwayat kunjungan & jadwal visite',
  },
  {
    id: 'gizi_pasien',
    label: 'Gizi Pasien',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    component: null,
    desc: 'Asesmen gizi & diet pasien',
  },
  {
    id: 'diagnosa',
    label: 'Diagnosa',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    component: null,
    desc: 'Diagnosa utama, penyerta & komplikasi',
  },
  {
    id: 'icd9',
    label: 'ICD 9',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    component: null,
    desc: 'Prosedur & tindakan kode ICD-9',
  },
 {
  id: 'penunjang_medis',
  label: 'Penunjang Medis',
  icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  component: PenunjangMedis,
  desc: 'Lab, radiologi & patologi anatomi',
},
  {
    id: 'tindakan',
    label: 'Tindakan',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    component: null,
    desc: 'Tindakan & layanan medis',
  },
  {
    id: 'resep',
    label: 'Resep',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    component: ResepDetail,
    desc: 'Resep obat & riwayat pemberian',
  },
  {
    id: 'cppt',
    label: 'CPPT',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    component: null,
    desc: 'Catatan perkembangan pasien terintegrasi',
  },
  {
    id: 'resume_medis',
    label: 'Resume Medis',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    component: null,
    desc: 'Resume akhir perawatan pasien',
  },
  {
    id: 'ringkasan_masuk_keluar',
    label: 'Ringkasan Masuk/Keluar',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    component: null,
    desc: 'Ringkasan admisi dan pemulangan',
  },
  {
    id: 'ruangan',
    label: 'Ruangan',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    component: null,
    desc: 'Info ruangan & riwayat pindah ruang',
  },
  {
    id: 'data_sirs',
    label: 'Data SIRS',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    component: null,
    desc: 'Data sistem informasi rumah sakit',
  },
]

// ── Placeholder card ──────────────────────────────────────────────────
const Placeholder = ({ menu }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-6">
    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={menu.icon}/>
      </svg>
    </div>
    <p className="text-base font-bold text-gray-700 mb-1">{menu.label}</p>
    <p className="text-sm text-gray-400 mb-5 max-w-xs">{menu.desc}</p>
    <code className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-500 font-mono">
      import {menu.label.replace(/[\s/]+/g, '')} from './detail/{menu.id}'
    </code>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
const DetailPelayanan = () => {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const patient    = state?.patient ?? DEFAULT_PATIENT

  const [activeMenu, setActiveMenu] = useState('kunjungan')

  const current    = MENU.find(m => m.id === activeMenu)
  const ActivePage = current?.component

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6 space-y-4">

        {/* ── Judul + breadcrumb ── */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pelayanan')}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-500 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Detail Rawat Inap</h1>
        </div>

        {/* ── Patient card ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#0d9488,#14b8a6,#0d9488)' }}/>
          <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-lg font-bold text-teal-600 leading-tight">{patient.nama}</p>
              <p className="text-sm text-gray-500 font-mono">#{patient.noRM}</p>
              <div className="flex flex-wrap gap-x-8 gap-y-0.5 text-sm mt-2">
                <p><span className="text-gray-500">Registrasi: </span><span className="font-medium">{patient.noRegistrasi}</span></p>
                <p><span className="text-gray-500">DPJP: </span><span className="font-medium">{patient.dpjp}</span></p>
                <p><span className="text-gray-500">Kamar: </span><span className="font-medium">{patient.kamar}</span></p>
                <p><span className="text-gray-500">Masuk: </span><span className="font-medium">{patient.masuk}</span></p>
                <p><span className="text-gray-500">Jenis Pasien: </span><span className="font-medium">{patient.jenisPasien}</span></p>
                <p>
                  <span className="text-gray-500">Status: </span>
                  <span className={`inline-flex items-center gap-1 font-semibold ${patient.status === 'dirawat' ? 'text-teal-600' : 'text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${patient.status === 'dirawat' ? 'bg-teal-500 animate-pulse' : 'bg-gray-400'}`}/>
                    {patient.status === 'dirawat' ? 'Sedang Dirawat' : 'Sudah Pulang'}
                  </span>
                </p>
              </div>
            </div>

            {/* Tombol aksi */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Formulir Identitas Pasien
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                Label Pasien
              </button>
            </div>
          </div>
        </div>

        {/* ── Layout sidebar + konten ── */}
        <div className="flex gap-4 items-start">

          {/* Sidebar kiri */}
          <div className="w-52 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {MENU.map(item => {
                const isActive = activeMenu === item.id
                return (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-b border-gray-100 last:border-0 text-left"
                    style={{
                      background: isActive ? '#0d9488' : 'transparent',
                      color:      isActive ? '#ffffff'  : '#374151',
                    }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none"
                      stroke={isActive ? '#ffffff' : '#9ca3af'}
                      strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                    </svg>
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Konten kanan */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm min-h-[500px] min-w-0">
            {ActivePage
              ? <ActivePage patient={patient}/>
              : <Placeholder menu={current}/>
            }
          </div>

        </div>
      </div>
    </div>
  )
}

export default DetailPelayanan