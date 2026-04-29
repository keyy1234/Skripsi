import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PinModal from '../../../components/PinModal';
import ToastNotification from '../../../components/ToastNotification';

// Import komponen-komponen yang ADA
import PatientInfoCard from './components/PatientInfoCard';
import LeftSidebar from './components/LeftSidebar';
import TopTabs from './components/TopTabs';
import Anamnesis from './sections/Anamnesis';
import TTV from './sections/TTV';
import PemeriksaanFisik from './sections/PemeriksaanFisik';
import PemeriksaanFungsional from './sections/PemeriksaanFungsional';
import RiwayatPerjalanan from './sections/RiwayatPerjalanan';
// import CPPTSection from './sections/CPPTSection';
// import DPJPSection from './sections/DPJPSection';

// ========== YANG TIDAK ADA (DIHAPUS) ==========
// import TujuanPerawatan from './sections/TujuanPerawatan';
// import PenilaianRisiko from './sections/PenilaianRisiko';
// import Penunjang from './sections/Penunjang';
// import Diagnosa from './sections/Diagnosa';
// import RencanaKerja from './sections/RencanaKerja';
// import Prognosis from './sections/Prognosis';
// import DiagnosaAwal from './sections/DiagnosaAwal';

const AsesMenMedis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient || null;

  const [topTab, setTopTab] = useState('pemeriksaan');
  const [leftMenu, setLeftMenu] = useState('anamnesis');
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Refs untuk mengambil data dari setiap section (yang ADA)
  const anamnesisRef = useRef();
  const ttvRef = useRef();
  const fisikRef = useRef();
  const fungsionalRef = useRef();
  const riwayatPerjalananRef = useRef();
  const cpptRef = useRef();
  const dpjpRef = useRef();

  // ========== REF YANG TIDAK ADA (DIHAPUS) ==========
  // const tujuanPerawatanRef = useRef();
  // const penilaianRisikoRef = useRef();
  // const penunjangRef = useRef();
  // const diagnosaRef = useRef();
  // const rencanaRef = useRef();
  // const prognosisRef = useRef();
  // const diagnosaAwalRef = useRef();

  const API_URL = 'http://localhost:5000';
  const token = localStorage.getItem('token');

  // Fungsi untuk mengumpulkan semua data (hanya yang ADA)
  const collectAllData = () => {
    const allData = {};

    if (anamnesisRef.current) {
      allData.anamnesis = anamnesisRef.current.getData();
    }
    if (ttvRef.current) {
      allData.ttv = ttvRef.current.getData();
    }
    if (fisikRef.current) {
      allData.pemeriksaan_fisik = fisikRef.current.getData();
    }
    if (fungsionalRef.current) {
      allData.pemeriksaan_fungsional = fungsionalRef.current.getData();
    }
    if (riwayatPerjalananRef.current) {
      allData.riwayat_perjalanan = riwayatPerjalananRef.current.getData();
    }
    if (cpptRef.current) {
      allData.cppt = cpptRef.current.getData();
    }
    if (dpjpRef.current) {
      allData.dpjp = dpjpRef.current.getData();
    }

    return allData;
  };

  const showToastMessage = (message, type) => {
    setToast({ message, type });
  };

  const handleSaveWithPin = async (pin) => {
    setIsSaving(true);
    setShowPinModal(false);

    try {
      const allData = collectAllData();
      const patientId = patient?.patient_id || patient?.pasien?.id || patient?.id;
      
      showToastMessage('⏳ Menyimpan data ke database...', 'info');
      
      const response = await fetch(`${API_URL}/api/rekam-medis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: allData,
          patientId: patientId,
          recordType: 'asesmen_medis',
          pin: pin
        })
      });

      const result = await response.json();

      if (result.success) {
        showToastMessage('✅ Data berhasil disimpan!', 'success');
        setTimeout(() => {
          navigate('/pelayanan');
        }, 2000);
      } else {
        showToastMessage(result.message || 'Gagal menyimpan data', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToastMessage('Terjadi kesalahan saat menyimpan data', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (!patient) {
      showToastMessage('Tidak ada data pasien', 'error');
      return;
    }
    setShowPinModal(true);
  };

  // Jika tidak ada patient
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

  // Menu sidebar kiri (hanya yang ADA)
  const menuItems = [
    { id: 'anamnesis', label: 'Anamnesis' },
    { id: 'ttv', label: 'TTV & Antropometri' },
    { id: 'fisik', label: 'Pemeriksaan Fisik' },
    { id: 'fungsional', label: 'Pemeriksaan Fungsional' },
    { id: 'riwayat_perjalanan', label: 'Riwayat Perjalanan Penyakit' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6 space-y-5">
        <PatientInfoCard patient={patient} />

        <TopTabs activeTab={topTab} onTabChange={setTopTab} />

        {topTab === 'pemeriksaan' && (
          <div className="flex gap-5">
            {/* Left Sidebar */}
            <div className="w-52 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {menuItems.map((item) => {
                  const isActive = leftMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLeftMenu(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-b border-gray-100 last:border-0 text-left"
                      style={{
                        background: isActive ? '#0d9488' : 'transparent',
                        color: isActive ? '#ffffff' : '#374151',
                      }}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-w-0">
              {leftMenu === 'anamnesis' && <Anamnesis ref={anamnesisRef} />}
              {leftMenu === 'ttv' && <TTV ref={ttvRef} />}
              {leftMenu === 'fisik' && <PemeriksaanFisik ref={fisikRef} />}
              {leftMenu === 'fungsional' && <PemeriksaanFungsional ref={fungsionalRef} />}
              {leftMenu === 'riwayat_perjalanan' && <RiwayatPerjalanan ref={riwayatPerjalananRef} />}
            </div>
          </div>
        )}

        {topTab === 'cppt' && <CPPTSection ref={cpptRef} />}
        {topTab === 'dpjp' && <DPJPSection ref={dpjpRef} patient={patient} />}

        {/* Tombol Simpan */}
        <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
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
                Simpan & Verifikasi
              </>
            )}
          </button>
        </div>
      </div>

      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handleSaveWithPin}
        isLoading={isSaving}
      />

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AsesMenMedis;