import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBlockchainNotification } from '../../../../context/BlockchainNotificationContext';

// ── Import semua komponen ──────────────────────────────────────────────
import Anamnesis from './anamnesis';
import Pemeriksaan from './pemeriksaan';
import StatusFungsional from './status_fungsional';
import AsesMenResikoJatuh from './resiko_jatuh';
import CPPT from './cppt_awal';

// ── Default patient ───────────────────────────────────────────────────
const DEFAULT_PATIENT = {
  noRM: '082389', nama: 'IS**N**', noRegistrasi: 'RI072024.0001',
  dpjp: 'Dokter Spesialis 10', jenisPasien: 'Umum',
  ruangan: 'Adenium 1.D', umur: '86 Thn 0 Bln 26 Hari',
  dikirimOleh: 'Puskesmas', tanggalMasuk: '27 Juli 2024', tanggalKeluar: '-',
};

// ── Menu kiri ─────────────────────────────────────────────────────────
const MENU = [
  { id: 'anamnesis', label: 'Anamnesis', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'pemeriksaan', label: 'Pemeriksaan', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'status_fungsional', label: 'Status Fungsional', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'resiko_jatuh', label: 'Asesmen Resiko Jatuh', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'cppt', label: 'CPPT', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
];

// ── Main ──────────────────────────────────────────────────────────────
const AsesMenKeperawatan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient || null;
  
  const { showBlockchainNotification, updateBlockchainNotification } = useBlockchainNotification();
  
  const [activeMenu, setActiveMenu] = useState('anamnesis');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // ── STATE UNTUK MENYIMPAN DATA SEMUA KOMPONEN ──
  // Data Anamnesis
  const [anamnesisData, setAnamnesisData] = useState({
    keluhanUtama: '',
    riwayatPasien: [],
    riwayatPasienTeks: '',
    riwayatKeluarga: [],
    riwayatKeluargaTeks: '',
    alergiMakanan: 'Silakan Pilih',
    listAlergiMakanan: [],
    listAlergiObat: [],
    caraMasuk: '',
    kondisiMasuk: '',
    sumberInfo: '',
    bahasa: '',
    hambatan: '',
    catatan: ''
  });
  
  // Data Pemeriksaan
  const [pemeriksaanData, setPemeriksaanData] = useState({
    gcs: { e: '4', v: '5', m: '6' },
    ttv: {
      nadi: '',
      suhu: '',
      nafas: '',
      sistolik: '',
      diastolik: '',
      spo2: '',
      beratBadan: '',
      tinggiBadan: ''
    },
    pemeriksaanFisik: {
      kepala: 'normal', mata: 'normal', hidung: 'normal', telinga: 'normal',
      mulut: 'normal', leher: 'normal', thoraks: 'normal', jantung: 'normal',
      paru: 'normal', abdomen: 'normal', ekstremitasAtas: 'normal',
      ekstremitasBawah: 'normal', kulit: 'normal', genetalia: 'normal', neurologis: 'normal'
    },
    catatanFisik: {}
  });
  
  // Data Status Fungsional
  const [statusFungsionalData, setStatusFungsionalData] = useState({
    bowel: { value: 0, label: 'Inkontinen/tidak teratur (perlu enema)' },
    bladder: { value: 0, label: 'Inkontinen atau pakai kateter dan tak terkontrol' },
    grooming: { value: 0, label: 'Butuh pertolongan orang lain' },
    toilet: { value: 0, label: 'Tidak mampu' },
    feeding: { value: 0, label: 'Tidak mampu' },
    transfer: { value: 0, label: 'Tidak mampu' },
    mobility: { value: 0, label: 'Tidak mampu' },
    dressing: { value: 0, label: 'Tergantung' },
    stairs: { value: 0, label: 'Tidak mampu' },
    bathing: { value: 0, label: 'Tergantung' }
  });
  
  // Data Resiko Jatuh
  const [resikoJatuhData, setResikoJatuhData] = useState(null);
  
  // Data CPPT
  const [cpptData, setCpptData] = useState({
    subjective: '',
    objective: {
      ku: 'Baik', gcs: '15', gcsLabel: 'Compos Mentis',
      nadi: '', tdSistolik: '', tdDiastolik: '', suhu: '', rr: '', spo2: '', tb: '', bb: ''
    },
    assessment: '',
    planning: '',
    instruksiPPA: '',
    tanggal: new Date().toISOString().slice(0, 16),
    dibuatOleh: localStorage.getItem('userName') || 'Perawat'
  });
  
  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000';
  
  // Fungsi untuk mengumpulkan semua data
  const collectAllData = () => {
    return {
      patient_id: patient?.patient_id || patient?.pasien?.id || patient?.id,
      admisi_id: patient?.id,
      no_registrasi: patient?.no_registrasi,
      no_rm: patient?.no_rm,
      anamnesis: {
        keluhan_utama: anamnesisData.keluhanUtama,
        riwayat_penyakit_pasien_list: anamnesisData.riwayatPasien,
        riwayat_penyakit_pasien_keterangan: anamnesisData.riwayatPasienTeks,
        riwayat_penyakit_keluarga_list: anamnesisData.riwayatKeluarga,
        riwayat_penyakit_keluarga_keterangan: anamnesisData.riwayatKeluargaTeks,
        alergi_makanan: anamnesisData.listAlergiMakanan,
        alergi_obat: anamnesisData.listAlergiObat,
        cara_masuk: anamnesisData.caraMasuk,
        kondisi_masuk: anamnesisData.kondisiMasuk,
        sumber_informasi: anamnesisData.sumberInfo,
        bahasa: anamnesisData.bahasa,
        hambatan_komunikasi: anamnesisData.hambatan,
        catatan_tambahan: anamnesisData.catatan
      },
      pemeriksaan: {
        gcs: pemeriksaanData.gcs,
        ttv: pemeriksaanData.ttv,
        pemeriksaan_fisik: pemeriksaanData.pemeriksaanFisik,
        catatan_fisik: pemeriksaanData.catatanFisik
      },
      status_fungsional: {
        items: statusFungsionalData
      },
      resiko_jatuh: resikoJatuhData,
      cppt: cpptData
    };
  };
  
  // Handler untuk update data dari child components
  const handleAnamnesisChange = (data) => {
    setAnamnesisData(prev => ({ ...prev, ...data }));
  };
  
  const handlePemeriksaanChange = (data) => {
    setPemeriksaanData(prev => ({ ...prev, ...data }));
  };
  
  const handleStatusFungsionalChange = (data) => {
    setStatusFungsionalData(prev => ({ ...prev, ...data }));
  };
  
  const handleResikoJatuhChange = (data) => {
    setResikoJatuhData(data);
  };
  
  const handleCpptChange = (data) => {
    setCpptData(prev => ({ ...prev, ...data }));
  };
  
  // Fungsi simpan semua data
  const handleSaveAll = async () => {
    if (!patient) {
      setError('Tidak ada data pasien');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    const allData = collectAllData();
    console.log('Saving all asesmen data:', allData);
    
    showBlockchainNotification('pending', null, 'Menyimpan semua data asesmen keperawatan...');
    
    try {
      const response = await fetch(`${API_URL}/api/asesmen-keperawatan/save-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(allData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        updateBlockchainNotification('success', null, 'Semua data asesmen berhasil disimpan dan diverifikasi!');
        setSuccess('Semua数据 asesmen keperawatan berhasil disimpan!');
        
        setTimeout(() => {
          navigate('/pelayanan');
        }, 2000);
      } else {
        updateBlockchainNotification('error', null, result.message || 'Gagal menyimpan data');
        setError(result.message || 'Gagal menyimpan数据');
      }
    } catch (err) {
      console.error('Save all error:', err);
      updateBlockchainNotification('error', null, 'Terjadi kesalahan saat menyimpan');
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render komponen berdasarkan activeMenu
  const renderActiveComponent = () => {
    switch (activeMenu) {
      case 'anamnesis':
        return (
          <Anamnesis 
            patient={patient}
            data={anamnesisData}
            onDataChange={handleAnamnesisChange}
          />
        );
      case 'pemeriksaan':
        return (
          <Pemeriksaan 
            patient={patient}
            data={pemeriksaanData}
            onDataChange={handlePemeriksaanChange}
          />
        );
      case 'status_fungsional':
        return (
          <StatusFungsional 
            patient={patient}
            data={statusFungsionalData}
            onDataChange={handleStatusFungsionalChange}
          />
        );
      case 'resiko_jatuh':
        return (
          <AsesMenResikoJatuh 
            patient={patient}
            data={resikoJatuhData}
            onDataChange={handleResikoJatuhChange}
          />
        );
      case 'cppt':
        return (
          <CPPT 
            patient={patient}
            data={cpptData}
            onDataChange={handleCpptChange}
          />
        );
      default:
        return null;
    }
  };
  
  if (!patient) {
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
          <button onClick={() => navigate('/pelayanan')} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
            Kembali ke Pelayanan
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6 space-y-5">
        
        {/* Error & Success */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
        
        {/* Patient Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#0d9488,#14b8a6,#0d9488)' }} />
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{patient?.pasien?.name || patient?.nama || '-'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-1 text-sm">
              <p><span className="text-gray-500">No. Registrasi: </span><span className="font-medium">{patient?.no_registrasi || '-'}</span></p>
              <p><span className="text-gray-500">Jenis Pasien: </span><span className="font-medium">{patient?.jenis_pasien || 'Umum'}</span></p>
              <p><span className="text-gray-500">Rekam Medis: </span><span className="font-medium">{patient?.no_rm || '-'}</span></p>
              <p><span className="text-gray-500">Ruangan: </span><span className="font-medium">{patient?.nama_kamar || '-'}</span></p>
              <p><span className="text-gray-500">Umur: </span><span className="font-medium">{patient?.umur || '-'}</span></p>
              <p><span className="text-gray-500">DPJP: </span><span className="font-medium">{patient?.dpjp || '-'}</span></p>
            </div>
          </div>
        </div>
        
        {/* Layout: Sidebar + Content */}
        <div className="flex gap-5 items-start">
          
          {/* Sidebar */}
          <div className="w-52 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {MENU.map((item) => {
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-b border-gray-100 last:border-0 text-left"
                    style={{
                      background: isActive ? '#0d9488' : 'transparent',
                      color: isActive ? '#ffffff' : '#374151',
                    }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={isActive ? '#ffffff' : '#9ca3af'} strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm min-w-0">
            {renderActiveComponent()}
          </div>
          
        </div>
        
        {/* Tombol Simpan Semua */}
        <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Semua Asesmen
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default AsesMenKeperawatan;