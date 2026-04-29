import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { formatDate, calculateAge, formatGender, getTriageLabel, getTriageColor, getStatusLabel, getStatusColor } from './utils/igdUtils';
import TTVSection from './sections/TTVSection';
import TreatmentSection from './sections/TreatmentSection';
import SOAPSection from './sections/SOAPSection';
import DiagnosisSection from './sections/DiagnosisSection';
import DispositionSection from './sections/DispositionSection';
import DiagnosticTestSection from './sections/DiagnosticTestSection';
import ResepSection from './sections/ResepSection'; // ← TAMBAHKAN INI

// Placeholder components
const PlaceholderContent = ({ title }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-gray-400">Halaman {title} sedang dalam pengembangan</p>
    <p className="text-xs text-gray-300 mt-1">(Komponen akan dibuat terpisah)</p>
  </div>
);

// Menu sidebar kiri - TAMBAHKAN MENU RESEP
const menuItems = [
  { id: 'ttv', label: 'TTV & Antropometri', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ) },
  { id: 'diagnosis', label: 'Diagnosis', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ) },
  { id: 'treatment', label: 'Treatment / Tindakan', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ) },
  { id: 'resep', label: 'Resep Obat', icon: (  // ← MENU RESEP BARU
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ) },
  { id: 'soap', label: 'Catatan SOAP', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ) },
  { id: 'diagnostic_test', label: 'Pemeriksaan Penunjang', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ) },
  { id: 'disposition', label: 'Disposisi / Pulang', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  ) },
];

// Patient Info Card Component (sama seperti sebelumnya)
const PatientInfoCard = ({ patient, encounter }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)' }} />
      <div className="px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">{patient?.patient_name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1.5 text-sm">
          <p><span className="text-gray-500">No. Registrasi: </span><span className="font-medium">IGD{encounter?.encounter_id}</span></p>
          <p><span className="text-gray-500">NIK: </span><span className="font-medium">{patient?.nik?.slice(-6) || '-'}</span></p>
          <p><span className="text-gray-500">Jenis Kelamin: </span><span className="font-medium">{formatGender(patient?.gender)}</span></p>
          <p><span className="text-gray-500">Umur: </span><span className="font-medium">{calculateAge(patient?.date_of_birth)}</span></p>
          <p><span className="text-gray-500">Tanggal Masuk: </span><span className="font-medium">{formatDate(encounter?.encounter_start_time)}</span></p>
          <p><span className="text-gray-500">Triage: </span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${getTriageColor(encounter?.triage_level)}`}>
              {getTriageLabel(encounter?.triage_level)}
            </span>
          </p>
          <p><span className="text-gray-500">Status: </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(encounter?.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${encounter?.status === 'ONGOING' ? 'bg-teal-500 animate-pulse' : encounter?.status === 'TRIAGE' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'}`} />
              {getStatusLabel(encounter?.status)}
            </span>
          </p>
          <p><span className="text-gray-500">DPJP: </span><span className="font-medium">{encounter?.medic_staff?.staff_name || '-'}</span></p>
        </div>
      </div>
    </div>
  );
};

const DetailIGD = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [leftMenu, setLeftMenu] = useState('ttv');
  const [encounter, setEncounter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Ambil data encounter dari props atau fetch ulang
  useEffect(() => {
    if (location.state?.encounter) {
      setEncounter(location.state.encounter);
      setIsLoading(false);
    } else if (id) {
      fetchEncounterDetail();
    } else {
      navigate('/igd');
    }
  }, [id]);

  const fetchEncounterDetail = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('encounters')
        .select(`
          encounter_id,
          status,
          encounter_start_time,
          encounter_end_time,
          chief_complaint,
          triage_level,
          responsible_staff_id,
          created_at,
          patients!encounters_patient_id_fkey (
            patient_id,
            patient_name,
            nik,
            gender,
            phone_number,
            date_of_birth,
            blood_type,
            emergency_contact_name,
            emergency_contact_phone,
            patient_history_of_allergies,
            patient_disease_history
          ),
          medic_staff!encounters_responsible_staff_id_fkey (
            staff_id,
            staff_name,
            specialization
          )
        `)
        .eq('encounter_id', id)
        .single();

      if (error) throw error;
      setEncounter(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal mengambil data pasien');
    } finally {
      setIsLoading(false);
    }
  };

  // Render konten berdasarkan menu yang dipilih - TAMBAHKAN CASE 'resep'
  const renderContent = () => {
    switch (leftMenu) {
      case 'ttv':
        return <TTVSection encounterId={encounter?.encounter_id} encounter={encounter} />;
      case 'diagnosis':
        return <DiagnosisSection encounterId={encounter?.encounter_id} encounter={encounter} />;
      case 'treatment':
        return <TreatmentSection encounterId={encounter?.encounter_id} encounter={encounter} />;
      case 'resep': // ← TAMBAHKAN CASE UNTUK RESEP
        return (
          <ResepSection 
            encounterId={encounter?.encounter_id} 
            encounter={encounter}
            patient={encounter?.patients}
          />
        );
      case 'soap':
        return <SOAPSection encounterId={encounter?.encounter_id} encounter={encounter} />;
      case 'diagnostic_test':
        return <DiagnosticTestSection encounterId={encounter?.encounter_id} encounter={encounter} />;
      case 'disposition':
        return <DispositionSection 
          encounterId={encounter?.encounter_id} 
          encounter={encounter}
          onDispositionComplete={() => {
            if (id) fetchEncounterDetail();
          }}
        />;
      default:
        return <PlaceholderContent title="Menu" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg className="animate-spin h-8 w-8 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500">Memuat data pasien...</p>
        </div>
      </div>
    );
  }

  if (error || !encounter) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-red-500">{error || 'Data pasien tidak ditemukan'}</p>
          <button
            onClick={() => navigate('/igd')}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Kembali ke IGD
          </button>
        </div>
      </div>
    );
  }

  const patient = encounter.patients;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6 space-y-5">
        
        {/* Tombol Kembali */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/igd')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke IGD
          </button>
          
          {/* Badge Status */}
          <div className="flex gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(encounter.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${encounter.status === 'ONGOING' ? 'bg-teal-500 animate-pulse' : encounter.status === 'TRIAGE' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'}`} />
              {getStatusLabel(encounter.status)}
            </span>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getTriageColor(encounter.triage_level)}`}>
              {getTriageLabel(encounter.triage_level)}
            </span>
          </div>
        </div>

        {/* Patient Info Card */}
        <PatientInfoCard patient={patient} encounter={encounter} />

        {/* Layout: Sidebar + Content */}
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
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-w-0">
            {renderContent()}
          </div>
        </div>

        {/* Tombol Aksi (Selesai / Rujuk) */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => {/* TODO: handle discharge */}}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            ✅ Selesai & Pulang
          </button>
          <button
            onClick={() => {/* TODO: handle admit to rawat inap */}}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            🏥 Rujuk Rawat Inap
          </button>
        </div>

      </div>
    </div>
  );
};

export default DetailIGD;