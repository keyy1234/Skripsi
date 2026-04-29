// src/pages/igd/sections/SOAPSection.jsx
import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SOAPSection = ({ encounterId, encounter }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [soapList, setSoapList] = useState([]);
  const [latestTTV, setLatestTTV] = useState(null);
  const [latestDiagnoses, setLatestDiagnoses] = useState([]);
  const [planData, setPlanData] = useState({
    treatments: [],
    prescriptions: [],
    diagnosticTests: [],
    formattedPlan: '',
    counts: { total: 0 }
  });
  
  // Auto-fill options
  const [autoFillAssessment, setAutoFillAssessment] = useState(false);
  const [autoFillPlan, setAutoFillPlan] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  const getToken = () => localStorage.getItem('token');

  const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  };

  // Fetch latest TTV for preview
  const fetchLatestTTV = async () => {
    if (!encounterId) return;
    
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/soap/latest-ttv/${encounterId}`);
      if (data.success) {
        setLatestTTV(data.data);
      }
    } catch (err) {
      console.error('Fetch latest TTV error:', err);
    }
  };

  // Fetch latest diagnoses for Assessment
  const fetchLatestDiagnoses = async () => {
    if (!encounterId) return;
    
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/soap/latest-diagnoses/${encounterId}`);
      if (data.success) {
        setLatestDiagnoses(data.data.diagnoses || []);
        if (autoFillAssessment && !form.assessment) {
          setForm(prev => ({ ...prev, assessment: data.data.formattedAssessment || '' }));
        }
      }
    } catch (err) {
      console.error('Fetch diagnoses error:', err);
    }
  };

  // Fetch plan data from 3 sources (Treatment, Resep, Diagnostic Tests)
  const fetchPlanData = async () => {
    if (!encounterId) return;
    
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/soap/plan-data/${encounterId}`);
      if (data.success) {
        setPlanData(data.data);
        if (autoFillPlan && !form.plan) {
          setForm(prev => ({ ...prev, plan: data.data.formattedPlan }));
        }
      }
    } catch (err) {
      console.error('Fetch plan data error:', err);
    }
  };

  // Fetch SOAP history
  const fetchSOAPHistory = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/soap/${encounterId}`);
      if (data.success) {
        setSoapList(data.data);
      }
    } catch (err) {
      console.error('Fetch SOAP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create SOAP note
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.subjective && !form.objective && !form.assessment && !form.plan) {
      alert('Isi minimal satu bagian SOAP');
      return;
    }

    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/soap`, {
        method: 'POST',
        body: JSON.stringify({
          encounter_id: parseInt(encounterId),
          subjective: form.subjective,
          objective: form.objective,
          assessment: form.assessment,
          plan: form.plan,
          note_time: new Date().toISOString(),
          auto_fill_from_diagnoses: autoFillAssessment && !form.assessment,
          auto_fill_from_treatments: autoFillPlan && !form.plan
        })
      });
      
      if (data.success) {
        setForm({
          subjective: '',
          objective: '',
          assessment: '',
          plan: ''
        });
        
        fetchSOAPHistory();
        fetchLatestDiagnoses();
        fetchPlanData();
        
        const autoFillMessages = [];
        if (data.auto_filled?.objective) autoFillMessages.push('Objective (dari TTV)');
        if (data.auto_filled?.assessment) autoFillMessages.push('Assessment (dari Diagnosis)');
        if (data.auto_filled?.plan) autoFillMessages.push('Plan (dari Treatment/Resep/Penunjang)');
        
        alert(autoFillMessages.length > 0 
          ? `Catatan SOAP berhasil disimpan dengan auto-fill: ${autoFillMessages.join(', ')}`
          : 'Catatan SOAP berhasil disimpan');
      } else {
        alert(data.message || 'Gagal menyimpan catatan SOAP');
      }
    } catch (err) {
      console.error('Save SOAP error:', err);
      alert('Gagal menyimpan catatan SOAP');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Auto-fill objective from TTV
  const autoFillObjective = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/soap/latest-ttv/${encounterId}`);
      if (data.success && data.data) {
        const ttv = data.data.vital_sign_data;
        const parts = [];
        
        if (ttv.systolic && ttv.diastolic) parts.push(`TD: ${ttv.systolic}/${ttv.diastolic} mmHg`);
        if (ttv.heart_rate) parts.push(`Nadi: ${ttv.heart_rate} x/menit`);
        if (ttv.respiratory_rate) parts.push(`Napas: ${ttv.respiratory_rate} x/menit`);
        if (ttv.temperature) parts.push(`Suhu: ${ttv.temperature}°C`);
        if (ttv.spo2) parts.push(`SpO2: ${ttv.spo2}%`);
        if (ttv.weight) parts.push(`BB: ${ttv.weight} kg`);
        if (ttv.height) parts.push(`TB: ${ttv.height} cm`);
        
        if (parts.length > 0) {
          const timeInfo = `\n*(Diukur pada: ${new Date(data.data.measurement_time).toLocaleString('id-ID')})*`;
          setForm(prev => ({ ...prev, objective: `**TTV:** ${parts.join(', ')}${timeInfo}` }));
        } else {
          alert('Tidak ada data TTV yang tersedia');
        }
      } else {
        alert('Belum ada data TTV untuk encounter ini');
      }
    } catch (err) {
      console.error('Auto-fill objective error:', err);
      alert('Gagal mengambil data TTV');
    }
  };

  // Auto-fill assessment from diagnoses
  const autoFillAssessmentFromDiagnoses = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/soap/latest-diagnoses/${encounterId}`);
      if (data.success && data.data.formattedAssessment) {
        setForm(prev => ({ ...prev, assessment: data.data.formattedAssessment }));
      } else {
        alert('Belum ada data diagnosis untuk encounter ini');
      }
    } catch (err) {
      console.error('Auto-fill assessment error:', err);
      alert('Gagal mengambil data diagnosis');
    }
  };

  // Auto-fill plan from all sources
  const autoFillPlanFromAllSources = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/soap/plan-data/${encounterId}`);
      if (data.success && data.data.formattedPlan) {
        setForm(prev => ({ ...prev, plan: data.data.formattedPlan }));
        
        // Tampilkan ringkasan sumber data
        const counts = data.data.counts;
        alert(`Plan berhasil diisi dari:\n- ${counts.treatments} Tindakan Medis\n- ${counts.prescriptions} Resep Obat\n- ${counts.diagnosticTests} Pemeriksaan Penunjang`);
      } else {
        alert('Belum ada data Treatment, Resep, atau Pemeriksaan Penunjang untuk encounter ini');
      }
    } catch (err) {
      console.error('Auto-fill plan error:', err);
      alert('Gagal mengambil data plan');
    }
  };

  useEffect(() => {
    if (encounterId) {
      fetchSOAPHistory();
      fetchLatestTTV();
      fetchLatestDiagnoses();
      fetchPlanData();
    }
  }, [encounterId]);

  useEffect(() => {
    if (autoFillAssessment && latestDiagnoses.length > 0 && !form.assessment) {
      autoFillAssessmentFromDiagnoses();
    }
  }, [autoFillAssessment, latestDiagnoses]);

  useEffect(() => {
    if (autoFillPlan && planData.formattedPlan && !form.plan) {
      setForm(prev => ({ ...prev, plan: planData.formattedPlan }));
    }
  }, [autoFillPlan, planData.formattedPlan]);

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const highlightText = (text, type) => {
    if (!text) return null;
    const keywords = {
      subjective: ['nyeri', 'pusing', 'mual', 'demam', 'batuk', 'sesak', 'lemas', 'keluhan'],
      objective: ['td', 'nadi', 'suhu', 'spo2', 'kesadaran', 'edema', 'rales', 'wheezing', 'ttv'],
      assessment: ['diagnosis', 'membaik', 'memburuk', 'stabil', 'komplikasi', 'prognosis'],
      plan: ['lanjutkan', 'ganti', 'tambahkan', 'konsul', 'rujuk', 'pulang', 'kontrol', 'rencana', 'terapi']
    };
    const words = keywords[type] || [];
    let result = text;
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      result = result.replace(regex, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
    });
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">Catatan SOAP</h3>
        <p className="text-xs text-gray-500 mt-1">
          Subjective, Objective, Assessment, Planning - Catatan perkembangan pasien terstruktur
        </p>
      </div>

      {/* Info Panel - 3 kolom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* TTV Info */}
        <div className={`p-3 rounded-lg ${latestTTV ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500">📊 TTV Terakhir</p>
              {latestTTV ? (
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(latestTTV.measurement_time).toLocaleString('id-ID')}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Belum ada data</p>
              )}
            </div>
            <button
              type="button"
              onClick={autoFillObjective}
              disabled={!latestTTV}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Auto-fill O
            </button>
          </div>
        </div>

        {/* Diagnosis Info */}
        <div className={`p-3 rounded-lg ${latestDiagnoses.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500">📋 Diagnosis</p>
              <p className="text-xs text-gray-600 mt-1">
                {latestDiagnoses.length > 0 ? `${latestDiagnoses.length} diagnosis` : 'Belum ada data'}
              </p>
            </div>
            <button
              type="button"
              onClick={autoFillAssessmentFromDiagnoses}
              disabled={latestDiagnoses.length === 0}
              className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              Auto-fill A
            </button>
          </div>
        </div>

        {/* Plan Info */}
        <div className={`p-3 rounded-lg ${planData.counts.total > 0 ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500">📋 Rencana Tindakan</p>
              <p className="text-xs text-gray-600 mt-1">
                {planData.counts.total > 0 
                  ? `${planData.counts.total} item dari Treatment/Resep/Penunjang` 
                  : 'Belum ada data'}
              </p>
            </div>
            <button
              type="button"
              onClick={autoFillPlanFromAllSources}
              disabled={planData.counts.total === 0}
              className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Auto-fill P
            </button>
          </div>
        </div>
      </div>

      {/* Form Input SOAP */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Tambah Catatan SOAP
        </h4>
        
        {/* Auto-fill Checkboxes */}
        <div className="mb-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoFillAssessment}
              onChange={(e) => setAutoFillAssessment(e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-gray-700">🔁 Auto-fill <span className="text-yellow-600 font-semibold">Assessment (A)</span> dari Diagnosis</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoFillPlan}
              onChange={(e) => setAutoFillPlan(e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-gray-700">🔁 Auto-fill <span className="text-purple-600 font-semibold">Plan (P)</span> dari Treatment, Resep, & Penunjang</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* S - Subjective */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-blue-600 font-bold">S</span> - Subjective (Keluhan Pasien)
            </label>
            <textarea
              name="subjective"
              value={form.subjective}
              onChange={handleChange}
              rows={2}
              placeholder="Apa yang dirasakan/dikeluhkan pasien? Contoh: Pasien mengeluh nyeri kepala..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* O - Objective */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-green-600 font-bold">O</span> - Objective (Hasil Pemeriksaan)
            </label>
            <textarea
              name="objective"
              value={form.objective}
              onChange={handleChange}
              rows={4}
              placeholder="Hasil pemeriksaan fisik, TTV, lab. Klik tombol 'Auto-fill O' untuk mengisi otomatis dari TTV..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              💡 Klik tombol <strong className="text-green-600">"Auto-fill O"</strong> di atas untuk mengisi dari data TTV terbaru
            </p>
          </div>

          {/* A - Assessment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-yellow-600 font-bold">A</span> - Assessment (Analisis Dokter)
            </label>
            <textarea
              name="assessment"
              value={form.assessment}
              onChange={handleChange}
              rows={3}
              placeholder="Diagnosis, evaluasi kondisi pasien. Centang 'Auto-fill Assessment' atau klik tombol 'Auto-fill A' untuk mengisi dari diagnosis..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              💡 Centang <strong>"Auto-fill Assessment"</strong> atau klik tombol <strong className="text-yellow-600">"Auto-fill A"</strong> untuk mengisi dari diagnosis
            </p>
          </div>

          {/* P - Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-purple-600 font-bold">P</span> - Planning (Rencana Tindakan)
            </label>
            <textarea
              name="plan"
              value={form.plan}
              onChange={handleChange}
              rows={4}
              placeholder="Rencana terapi, tindakan selanjutnya. Centang 'Auto-fill Plan' atau klik tombol 'Auto-fill P' untuk mengisi dari Treatment, Resep, & Penunjang..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              💡 Centang <strong>"Auto-fill Plan"</strong> atau klik tombol <strong className="text-purple-600">"Auto-fill P"</strong> untuk mengisi otomatis dari:
              <br/>• 💊 Tindakan Medis (Treatment)
              <br/>• 💊 Resep Obat
              <br/>• 🔬 Pemeriksaan Penunjang (Lab/Radiologi)
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setForm({ subjective: '', objective: '', assessment: '', plan: '' });
              setAutoFillAssessment(false);
              setAutoFillPlan(false);
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Simpan Catatan SOAP
          </button>
        </div>
      </form>

      {/* Riwayat SOAP */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Riwayat Catatan SOAP ({soapList.length})
        </h4>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          </div>
        )}

        {!isLoading && soapList.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="text-gray-400">Belum ada catatan SOAP</p>
            <p className="text-xs text-gray-300 mt-1">Silakan input catatan SOAP pertama di form atas</p>
          </div>
        )}

        {!isLoading && soapList.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {soapList.map((soap) => (
              <div key={soap.soap_note_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      {formatTime(soap.note_time)}
                    </span>
                    {soap.created_by_profile && (
                      <span className="text-xs text-gray-500">
                        oleh: {soap.created_by_profile.name}
                        {soap.created_by_profile.role === 'dokter_dpjp' ? ' (Dokter)' : ' (Perawat)'}
                      </span>
                    )}
                  </div>
                </div>
                
                {soap.subjective && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">S - Subjective</p>
                    <p className="text-sm text-gray-700 mt-1">{highlightText(soap.subjective, 'subjective')}</p>
                  </div>
                )}
                
                {soap.objective && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">O - Objective</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{highlightText(soap.objective, 'objective')}</p>
                  </div>
                )}
                
                {soap.assessment && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">A - Assessment</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{highlightText(soap.assessment, 'assessment')}</p>
                  </div>
                )}
                
                {soap.plan && (
                  <div>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">P - Plan</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{highlightText(soap.plan, 'plan')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informasi Singkat */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700">
          <strong className="font-semibold">📋 Format SOAP & Fitur Auto-fill:</strong><br />
          • <strong className="text-blue-600">S (Subjective)</strong> - Keluhan pasien, riwayat penyakit (input manual)<br />
          • <strong className="text-green-600">O (Objective)</strong> - Hasil pemeriksaan fisik, TTV, lab <span className="bg-green-100 px-1 rounded">⚡ Auto-fill dari TTV</span><br />
          • <strong className="text-yellow-600">A (Assessment)</strong> - Diagnosis, evaluasi kondisi <span className="bg-yellow-100 px-1 rounded">⚡ Auto-fill dari Diagnosis</span><br />
          • <strong className="text-purple-600">P (Plan)</strong> - Rencana terapi, tindakan, follow up <span className="bg-purple-100 px-1 rounded">⚡ Auto-fill dari Treatment, Resep, & Pemeriksaan Penunjang</span>
        </p>
      </div>
    </div>
  );
};

export default SOAPSection;