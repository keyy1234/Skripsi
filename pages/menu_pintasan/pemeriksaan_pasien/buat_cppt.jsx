import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../../../components/ToastNotification';

export default function BuatCPPT() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    planning: '',
    instruksi_ppa: '',
    sbar_situation: '',
    sbar_background: '',
    sbar_assessment: '',
    sbar_recommendation: '',
    handover_perawat: '',
    lapor_dokter: ''
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // State untuk dropdown Planning
  const [openPlanningDropdown, setOpenPlanningDropdown] = useState(false);

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Tambah ke Assessment - langsung tambah template
  const addToAssessment = () => {
    const assessmentText = '--- Diagnosa ---\n- [Tulis diagnosa disini]';
    
    const newAssessment = form.assessment 
      ? form.assessment + '\n\n' + assessmentText
      : assessmentText;

    updateForm('assessment', newAssessment);
    setToast({ show: true, message: 'Template Assessment ditambahkan', type: 'success' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1500);
  };

  // Tambah ke Planning
  const addToPlanning = (jenis) => {
    let planningText = '';
    
    switch(jenis) {
      case 'resep':
        planningText = '--- Rencana Terapi (Resep) ---\n- [Tulis resep disini]';
        break;
      case 'radiologi':
        planningText = '--- Pemeriksaan Radiologi ---\n- [Tulis pemeriksaan radiologi disini]';
        break;
      case 'laboratorium':
        planningText = '--- Pemeriksaan Laboratorium ---\n- [Tulis pemeriksaan laboratorium disini]';
        break;
      case 'tindakan':
        planningText = '--- Rencana Tindakan ---\n- [Tulis tindakan medis disini]';
        break;
      default:
        return;
    }

    const newPlanning = form.planning 
      ? form.planning + '\n\n' + planningText
      : planningText;

    updateForm('planning', newPlanning);
    setOpenPlanningDropdown(false);
    setToast({ show: true, message: `Template ${jenis} ditambahkan ke Planning`, type: 'success' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1500);
  };

  const handleSave = () => {
    if (!form.subjective.trim()) {
      setToast({ show: true, message: 'Subjective harus diisi', type: 'error' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
      return;
    }

    setToast({ show: true, message: 'CPPT berhasil disimpan', type: 'success' });
    
    setForm({
      subjective: '',
      objective: '',
      assessment: '',
      planning: '',
      instruksi_ppa: '',
      sbar_situation: '',
      sbar_background: '',
      sbar_assessment: '',
      sbar_recommendation: '',
      handover_perawat: '',
      lapor_dokter: ''
    });
    
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
  };

  // Dropdown Planning - 4 pilihan
  const PlanningDropdown = () => (
    <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-64">
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Pilih Data Planning</h3>
        <button onClick={() => setOpenPlanningDropdown(false)} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      
      <div className="py-2">
        <button
          onClick={() => addToPlanning('resep')}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
        >
          <span className="text-xl">💊</span>
          <div>
            <p className="font-medium text-gray-800">Resep</p>
            <p className="text-xs text-gray-500">Tambahkan rencana terapi obat</p>
          </div>
        </button>
        
        <button
          onClick={() => addToPlanning('radiologi')}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
        >
          <span className="text-xl">🩻</span>
          <div>
            <p className="font-medium text-gray-800">Radiologi</p>
            <p className="text-xs text-gray-500">Tambahkan pemeriksaan radiologi</p>
          </div>
        </button>
        
        <button
          onClick={() => addToPlanning('laboratorium')}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
        >
          <span className="text-xl">🔬</span>
          <div>
            <p className="font-medium text-gray-800">Laboratorium</p>
            <p className="text-xs text-gray-500">Tambahkan pemeriksaan laboratorium</p>
          </div>
        </button>
        
        <button
          onClick={() => addToPlanning('tindakan')}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
        >
          <span className="text-xl">🩺</span>
          <div>
            <p className="font-medium text-gray-800">Tindakan</p>
            <p className="text-xs text-gray-500">Tambahkan rencana tindakan medis</p>
          </div>
        </button>
      </div>
    </div>
  );

  const TextArea = ({ label, field, rows = 6, placeholder = '', showAmbilData = false, isAssessment = false, isPlanning = false }) => (
    <div className="flex flex-col relative">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        {showAmbilData && (
          <button
            type="button"
            onClick={() => {
              if (isAssessment) addToAssessment();
              if (isPlanning) setOpenPlanningDropdown(true);
            }}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-full transition flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Ambil Data
          </button>
        )}
      </div>
      <textarea
        rows={rows}
        value={form[field]}
        onChange={e => updateForm(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
      />
      {isPlanning && openPlanningDropdown && <PlanningDropdown />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      <div className="max-w-screen-xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Buat Catatan Perkembangan Pasien Terintegrasi (CPPT)</h1>
          <p className="text-gray-500 text-sm mt-1">Lengkapi form dibawah untuk membuat catatan medis elektronik</p>
        </div>

        <div className="space-y-5">
          {/* SOAP form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded font-bold">SOAP</span>
              Catatan Perkembangan Pasien Terintegrasi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              <TextArea label="Subjective" field="subjective" rows={6} placeholder="Keluhan pasien..." />
              
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Objective</label>
                <textarea
                  rows={6}
                  value={form.objective}
                  onChange={e => updateForm('objective', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y font-mono text-xs leading-relaxed"
                  placeholder="KU: Baik&#10;GCS: Compos Mentis&#10;Nadi: 75 bpm&#10;TD: 120/90 mmHg&#10;Suhu: 36°C&#10;RR: 40x/menit&#10;SpO2: 90%"
                />
              </div>
              
              <TextArea 
                label="Assessment" 
                field="assessment" 
                rows={6} 
                placeholder="Diagnosis/penilaian klinis..." 
                showAmbilData={true}
                isAssessment={true}
              />
              
              <TextArea 
                label="Planning" 
                field="planning" 
                rows={6} 
                placeholder="Rencana tindak lanjut..." 
                showAmbilData={true}
                isPlanning={true}
              />
            </div>

            <TextArea label="Instruksi PPA" field="instruksi_ppa" rows={3} placeholder="Instruksi dari DPJP / PPA lain..." />
          </div>

          {/* SBAR form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Komunikasi Efektif</label>
              <div className="relative">
                <select className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700">
                  <option>Pelaporan Perkembangan Pasien</option>
                  <option>Serah Terima Pasien (Handover)</option>
                  <option>Konsultasi Dokter</option>
                  <option>Transfer Pasien</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <TextArea label="Situation" field="sbar_situation" rows={9} placeholder="Keluhan pasien saat ini..." />
              <TextArea label="Background" field="sbar_background" rows={9} placeholder="Riwayat penyakit pasien..." />
              <TextArea label="Assessment" field="sbar_assessment" rows={9} placeholder="Penilaian klinis saat ini..." />
              <TextArea label="Recommendation" field="sbar_recommendation" rows={9} placeholder="Rekomendasi tindak lanjut..." />
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Handover Perawat/Bidan</label>
                  <div className="relative">
                    <select
                      value={form.handover_perawat}
                      onChange={e => updateForm('handover_perawat', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">-- Silakan Pilih --</option>
                      <option>Perawat A</option>
                      <option>Perawat B</option>
                      <option>Bidan C</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lapor Dokter</label>
                  <div className="relative">
                    <select
                      value={form.lapor_dokter}
                      onChange={e => updateForm('lapor_dokter', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">-- Silakan Pilih --</option>
                      <option>Dokter Spesialis 10</option>
                      <option>Dokter Spesialis 50</option>
                      <option>Dokter Spesialis 166</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal &amp; Jam</label>
                  <p className="text-sm text-gray-700 font-medium py-2.5">
                    {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pb-2">
            <button 
              onClick={() => {
                setForm({
                  subjective: '',
                  objective: '',
                  assessment: '',
                  planning: '',
                  instruksi_ppa: '',
                  sbar_situation: '',
                  sbar_background: '',
                  sbar_assessment: '',
                  sbar_recommendation: '',
                  handover_perawat: '',
                  lapor_dokter: ''
                });
              }} 
              className="px-5 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Reset
            </button>
            <button 
              onClick={() => navigate(-1)} 
              className="px-5 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button 
              onClick={handleSave} 
              className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow-sm"
            >
              Simpan CPPT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}