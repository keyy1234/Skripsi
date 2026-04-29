import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Import semua halaman yang sudah dibuat
import RiwayatCPPT from './riwayat_cppt';
import Penunjang from './penunjang';
import DiagnosaProsedur from './diagnosa';
import Resep from './resep';
import Tindakan from './tindakan';
import PermintaanKonsul from './permintaan_konsul';
import BuatCPPT from './buat_cppt';

// ── Default patient (fallback jika tidak ada data) ──────────────────
const DEFAULT_PATIENT = {
  noRM: '-',
  nama: '-',
  noRegistrasi: '-',
  dpjp: '-',
  jenisPasien: '-',
  ruangan: '-',
  umur: '-',
  dikirimOleh: '-',
  tanggalMasuk: '-',
  tanggalKeluar: '-',
};

// ── Konfigurasi tab ───────────────────────────────────────────────────
const TABS = [
  {
    id: 'riwayat_cppt',
    label: 'Riwayat CPPT',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h7',
    component: RiwayatCPPT,
  },
  {
    id: 'penunjang',
    label: 'Penunjang',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    component: Penunjang,
  },
  {
    id: 'diagnosa_prosedur',
    label: 'Diagnosa & Prosedur',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    component: DiagnosaProsedur,
  },
  {
    id: 'tindakan',
    label: 'Tindakan',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    component: Tindakan,
  },
  {
    id: 'resep',
    label: 'Resep',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    component: Resep,
  },
  {
    id: 'buat_cppt',
    label: 'Buat CPPT',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    component: BuatCPPT,
  },
  {
    id: 'permintaan_konsul',
    label: 'Permintaan Konsul',
    icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
    component: PermintaanKonsul,
  },
  {
    id: 'dokter_pemeriksa',
    label: 'Dokter Pemeriksa',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    component: null,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN WRAPPER
// ═══════════════════════════════════════════════════════════════════════
const PemeriksaanPasien = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil data patient dari location.state (dikirim dari menu pintasan)
  const patientFromState = location.state?.patient || null;
  
  // State untuk data pasien
  const [patient, setPatient] = useState(DEFAULT_PATIENT);
  const [activeTab, setActiveTab] = useState('penunjang'); // Default ke penunjang
  const [isLoading, setIsLoading] = useState(true);

  // Proses data pasien dari state
  useEffect(() => {
    if (patientFromState) {
      // Mapping data dari berbagai kemungkinan struktur
      const mappedPatient = {
        id: patientFromState.id || patientFromState.patient_id,
        patient_id: patientFromState.patient_id || patientFromState.id,
        noRM: patientFromState.no_rm || patientFromState.noRM || '-',
        nama: patientFromState.pasien?.name || patientFromState.nama || patientFromState.name || '-',
        noRegistrasi: patientFromState.no_registrasi || patientFromState.noRegistrasi || '-',
        dpjp: patientFromState.dpjp || '-',
        jenisPasien: patientFromState.jenis_pasien || patientFromState.jenisPasien || 'Umum',
        ruangan: patientFromState.nama_kamar || patientFromState.ruangan || '-',
        umur: patientFromState.umur || '-',
        dikirimOleh: patientFromState.dikirim_oleh || patientFromState.dikirimOleh || '-',
        tanggalMasuk: patientFromState.tanggal_masuk || patientFromState.tanggalMasuk || '-',
        tanggalKeluar: patientFromState.tanggal_keluar || patientFromState.tanggalKeluar || '-',
        status: patientFromState.status || 'dirawat',
        // Data pasien lengkap untuk dikirim ke child components
        pasien: patientFromState.pasien || {
          id: patientFromState.patient_id,
          name: patientFromState.nama || patientFromState.name,
          nik: patientFromState.nik,
          gender: patientFromState.gender,
          birth_date: patientFromState.birth_date,
          phone: patientFromState.phone,
          email: patientFromState.email
        }
      };
      
      console.log('Mapped patient data:', mappedPatient);
      setPatient(mappedPatient);
    }
    setIsLoading(false);
  }, [patientFromState]);

  // Ambil komponen yang aktif
  const ActivePage = TABS.find(t => t.id === activeTab)?.component;

  // Jika tidak ada data pasien
  if (!patientFromState && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tidak Ada Data Pasien</h2>
          <p className="text-gray-500 mb-6">Silakan pilih pasien terlebih dahulu dari halaman Pelayanan.</p>
          <button
            onClick={() => navigate('/pelayanan')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Kembali ke Pelayanan
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-teal-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-gray-500">Memuat data pasien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6 space-y-5">

        {/* ── Patient Info Card ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#0d9488,#14b8a6,#0d9488)' }} />
          <div className="px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {patient.noRM !== '-' ? `[${patient.noRM}]` : ''} {patient.nama}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 text-sm">
              <p><span className="text-gray-500">No. Registrasi: </span><span className="font-medium">{patient.noRegistrasi}</span></p>
              <p><span className="text-gray-500">Ruangan: </span><span className="font-medium">{patient.ruangan}</span></p>
              <p><span className="text-gray-500">DPJP: </span><span className="font-medium">{patient.dpjp}</span></p>
              <p><span className="text-gray-500">Dikirim Oleh: </span><span className="font-medium">{patient.dikirimOleh}</span></p>
              <p><span className="text-gray-500">Jenis Pasien: </span><span className="font-medium">{patient.jenisPasien}</span></p>
              <p><span className="text-gray-500">Tanggal Masuk: </span><span className="font-medium">{patient.tanggalMasuk}</span></p>
              <p><span className="text-gray-500">Umur: </span><span className="font-medium">{patient.umur}</span></p>
              <p><span className="text-gray-500">Tanggal Keluar: </span><span className="font-medium">{patient.tanggalKeluar}</span></p>
            </div>
          </div>

          {/* ── Tab Navigation ── */}
          <div className="flex border-t border-gray-200 overflow-x-auto">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Render halaman aktif, kirim patient sebagai prop ── */}
        {ActivePage ? (
          <ActivePage patient={patient} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={TABS.find(t => t.id === activeTab)?.icon} />
              </svg>
            </div>
            <p className="text-base font-bold text-gray-700 mb-1">
              {TABS.find(t => t.id === activeTab)?.label}
            </p>
            <p className="text-sm text-gray-400">Halaman ini sedang dalam pengembangan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PemeriksaanPasien;