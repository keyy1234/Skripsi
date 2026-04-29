import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ToastNotification from '../../../components/ToastNotification';
import { useBlockchainNotification } from '../../../context/BlockchainNotificationContext';
import ProfessionalQRCode from '../../../components/ProfessionalQRCode';

const API_URL = 'http://localhost:5000';

// ── Simple QR placeholder ─────────────────────────────────────────────
const QRCode = () => (
  <div className="w-16 h-16 bg-white border border-gray-300 rounded flex items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 21 21" className="w-14 h-14">
      <rect x="1" y="1" width="7" height="7" fill="none" stroke="#222" strokeWidth="1"/>
      <rect x="2" y="2" width="5" height="5" fill="#222"/>
      <rect x="13" y="1" width="7" height="7" fill="none" stroke="#222" strokeWidth="1"/>
      <rect x="14" y="2" width="5" height="5" fill="#222"/>
      <rect x="1" y="13" width="7" height="7" fill="none" stroke="#222" strokeWidth="1"/>
      <rect x="2" y="14" width="5" height="5" fill="#222"/>
      <rect x="9" y="1" width="2" height="2" fill="#222"/>
      <rect x="11" y="1" width="2" height="2" fill="#222"/>
      <rect x="9" y="3" width="2" height="2" fill="#222"/>
      <rect x="13" y="9" width="2" height="2" fill="#222"/>
      <rect x="15" y="9" width="2" height="2" fill="#222"/>
      <rect x="9" y="9" width="2" height="2" fill="#222"/>
      <rect x="11" y="11" width="2" height="2" fill="#222"/>
      <rect x="9" y="13" width="2" height="2" fill="#222"/>
      <rect x="11" y="15" width="2" height="2" fill="#222"/>
      <rect x="13" y="13" width="2" height="2" fill="#222"/>
      <rect x="15" y="15" width="2" height="2" fill="#222"/>
      <rect x="17" y="13" width="2" height="2" fill="#222"/>
    </svg>
  </div>
);

// ── Salin button ──────────────────────────────────────────────────────
const SalinBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs font-medium text-gray-600 rounded hover:bg-gray-50 transition mt-2"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      {copied ? 'Tersalin!' : 'Salin'}
    </button>
  );
};

// ── Riwayat CPPT ──────────────────────────────────────────────────────
const RiwayatCPPT = ({ cpptList, onEdit, onDelete, isLoading, formatDate, formatTime, patient }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <svg className="animate-spin h-8 w-8 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-gray-500">Memuat data CPPT...</p>
      </div>
    );
  }

  if (cpptList.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500">Belum ada data CPPT</p>
        <button
          onClick={() => document.querySelector('[data-tab="buat"]')?.click()}
          className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
        >
          + Buat CPPT Baru
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-[160px_1fr_220px_120px_180px] border-b-2 border-red-400 bg-gray-50">
        {['Tanggal', 'SOAP', 'Instruksi PPA', 'PPA', 'Verifikasi DPJP'].map(h => (
          <div key={h} className="px-5 py-3 text-sm font-semibold text-gray-700">{h}</div>
        ))}
      </div>

      {cpptList.map((row, idx) => (
        <div key={row.id} className={`grid grid-cols-[160px_1fr_220px_120px_180px] border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
          {/* Tanggal */}
          <div className="px-5 py-4 border-r border-gray-100">
            <p className="text-sm text-gray-700 font-medium">{formatDate(row.created_at)}</p>
            <p className="text-xs text-gray-400 mb-3">{formatTime(row.created_at)}</p>
            <button
              onClick={() => onEdit(row)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs font-medium text-gray-600 rounded hover:bg-gray-50 transition w-full justify-center"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>

          {/* SOAP */}
          <div className="px-5 py-4 border-r border-gray-100 space-y-4">
            <div>
              <p className="text-sm font-bold text-gray-800 underline">Subjective:</p>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{row.subjective || '-'}</p>
              <SalinBtn text={row.subjective} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 underline">Objective:</p>
              <div className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                {row.objective || '-'}
              </div>
              <SalinBtn text={row.objective} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 underline">Assessment:</p>
              <p className="text-sm text-gray-700 mt-1">{row.assessment || '-'}</p>
              <SalinBtn text={row.assessment} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 underline">Planning:</p>
              <p className="text-sm text-gray-700 mt-1">{row.planning || '-'}</p>
              <SalinBtn text={row.planning} />
            </div>
          </div>

          {/* Instruksi PPA */}
          <div className="px-5 py-4 border-r border-gray-100">
            <p className="text-sm text-gray-700">{row.instruksi_ppa || '-'}</p>
            <SalinBtn text={row.instruksi_ppa} />
          </div>

          {/* PPA — QR + nama + tombol */}
          <div className="px-5 py-4 border-r border-gray-100 flex flex-col items-center gap-2">
            <ProfessionalQRCode
              data={{
                name: row.created_by_profile?.name || 'Tenaga Medis',
                role: row.staff_role || 'Perawat',
                nip: row.staff_nip || '-',
                unit: row.staff_unit || patient?.ruangan || '-',
                timestamp: row.created_at,
                recordId: row.id
              }}
              size={80}
              showLabel={true}
              label="Verifikasi Tenaga Medis"
            />
            <p className="text-xs font-semibold text-gray-700">{row.created_by_profile?.name || 'Perawat'}</p>
            <p className="text-xs text-gray-500">{row.staff_role || 'Perawat'}</p>
            <div className="flex gap-1.5 mt-1">
              <button
                onClick={() => onEdit(row)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition shadow-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => onDelete(row.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition shadow-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus
              </button>
            </div>
          </div>

          {/* Verifikasi DPJP */}
          <div className="px-5 py-4 flex items-start justify-center">
            {row.dpjp_verifikasi ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sudah Diverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-orange-500 text-white">
                Belum Diverifikasi
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Buat / Edit CPPT ──────────────────────────────────────────────────
const FormCPPT = ({ editData, patient, onSaved, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { showBlockchainNotification, updateBlockchainNotification } = useBlockchainNotification();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    subjective: editData?.subjective || '',
    objective: editData?.objective || '',
    assessment: editData?.assessment || '',
    planning: editData?.planning || '',
    instruksi_ppa: editData?.instruksi_ppa || '',
    sbar_situation: editData?.sbar_situation || '',
    sbar_background: editData?.sbar_background || '',
    sbar_assessment: editData?.sbar_assessment || '',
    sbar_recommendation: editData?.sbar_recommendation || '',
    handover_perawat: editData?.handover_perawat || '',
    lapor_dokter: editData?.lapor_dokter || ''
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const TextArea = ({ label, field, rows = 6, placeholder = '' }) => (
    <div className="flex flex-col">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <textarea
        rows={rows}
        value={form[field]}
        onChange={e => update(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
      />
    </div>
  );

  const handleSubmit = async () => {
    setIsSaving(true);
    setError('');

    if (!form.subjective) {
      setError('Subjective (keluhan pasien) wajib diisi');
      setIsSaving(false);
      return;
    }

    const patientId = patient?.patient_id || patient?.pasien?.id || patient?.id;
    if (!patientId) {
      setError('Data pasien tidak ditemukan');
      setIsSaving(false);
      return;
    }

    showBlockchainNotification('pending', null, 'Menyimpan CPPT...');

    try {
      const response = await fetch(`${API_URL}/api/cppt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientId,
          admisi_id: patient?.id,
          no_registrasi: patient?.no_registrasi,
          no_rm: patient?.no_rm,
          subjective: form.subjective,
          objective: form.objective,
          assessment: form.assessment,
          planning: form.planning,
          instruksi_ppa: form.instruksi_ppa,
          sbar_situation: form.sbar_situation,
          sbar_background: form.sbar_background,
          sbar_assessment: form.sbar_assessment,
          sbar_recommendation: form.sbar_recommendation,
          handover_perawat: form.handover_perawat,
          lapor_dokter: form.lapor_dokter
        })
      });

      const result = await response.json();

      if (result.success) {
        updateBlockchainNotification('success', result.data?.blockchain_tx_hash, 'CPPT berhasil disimpan!');
        onSaved();
      } else {
        updateBlockchainNotification('error', null, result.message || 'Gagal menyimpan CPPT');
        setError(result.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('Save error:', err);
      updateBlockchainNotification('error', null, 'Terjadi kesalahan saat menyimpan');
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
      
      {/* SOAP form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded font-bold">SOAP</span>
          Catatan Perkembangan Pasien Terintegrasi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          <TextArea label="Subjective" field="subjective" rows={6} placeholder="Keluhan pasien..." />
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Objective</label>
            <textarea
              rows={6}
              value={form.objective}
              onChange={e => update('objective', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y font-mono text-xs leading-relaxed"
              placeholder="KU: Baik&#10;GCS: Compos Mentis&#10;Nadi: 75 bpm&#10;TD: 120/90 mmHg"
            />
          </div>
          <TextArea label="Assessment" field="assessment" rows={6} placeholder="Diagnosis/penilaian klinis..." />
          <TextArea label="Planning" field="planning" rows={6} placeholder="Rencana tindak lanjut..." />
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
                  onChange={e => update('handover_perawat', e.target.value)}
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
                  onChange={e => update('lapor_dokter', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">-- Silakan Pilih --</option>
                  <option>Dokter Spesialis 10</option>
                  <option>Dokter Spesialis 50</option>
                  <option>Dokter Spesialis 166</option>
                  <option>Dokter Spesialis 167</option>
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
        <button onClick={onCancel} className="px-5 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition">
          Batal
        </button>
        <button onClick={handleSubmit} disabled={isSaving} className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50">
          {isSaving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            editData ? 'Simpan Perubahan' : 'Simpan CPPT'
          )}
        </button>
      </div>
    </div>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'riwayat', label: 'Riwayat CPPT', icon: 'M4 6h16M4 10h16M4 14h16M4 18h7' },
  { id: 'buat', label: 'Buat/Edit CPPT', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
];

// ── Main page ─────────────────────────────────────────────────────────
const CPPT = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient || null;

  const [activeTab, setActiveTab] = useState('riwayat');
  const [editData, setEditData] = useState(null);
  const [cpptList, setCpptList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (patient?.patient_id || patient?.id) {
      fetchCpptList();
    }
  }, [patient]);

  const fetchCpptList = async () => {
    setIsLoading(true);
    try {
      const patientId = patient?.patient_id || patient?.pasien?.id || patient?.id;
      const response = await fetch(`${API_URL}/api/cppt?patient_id=${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setCpptList(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Fetch CPPT error:', err);
      setError('Gagal mengambil data CPPT');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleEdit = (row) => {
    setEditData(row);
    setActiveTab('buat');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus CPPT ini?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/cppt/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        fetchCpptList();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Gagal menghapus CPPT');
    }
  };

  const handleSaved = () => {
    setEditData(null);
    setActiveTab('riwayat');
    fetchCpptList();
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
        {/* Patient info card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)' }} />
          <div className="px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{patient?.pasien?.name || patient?.nama || '-'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1.5 text-sm">
              <p><span className="text-gray-500">No. Registrasi: </span><span className="font-medium">{patient?.no_registrasi || '-'}</span></p>
              <p><span className="text-gray-500">Jenis Pasien: </span><span className="font-medium">{patient?.jenis_pasien || 'Umum'}</span></p>
              <p><span className="text-gray-500">Rekam Medis: </span><span className="font-medium">{patient?.no_rm || '-'}</span></p>
              <p><span className="text-gray-500">Ruangan: </span><span className="font-medium">{patient?.nama_kamar || '-'}</span></p>
              <p><span className="text-gray-500">Umur: </span><span className="font-medium">{patient?.umur || '-'}</span></p>
              <p><span className="text-gray-500">DPJP: </span><span className="font-medium">{patient?.dpjp || '-'}</span></p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-200 overflow-x-auto">
            <button
              data-tab="riwayat"
              onClick={() => { setActiveTab('riwayat'); setEditData(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'riwayat'
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h7" />
              </svg>
              Riwayat CPPT
            </button>
            <button
              data-tab="buat"
              onClick={() => { setActiveTab('buat'); setEditData(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'buat'
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Buat/Edit CPPT
            </button>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        {activeTab === 'riwayat' && (
          <RiwayatCPPT
            cpptList={cpptList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            formatDate={formatDate}
            formatTime={formatTime}
             patient={patient}  // ← TAMBAHKAN INI
          />
        )}
        
        {activeTab === 'buat' && (
          <FormCPPT
            editData={editData}
            patient={patient}
            onSaved={handleSaved}
            onCancel={() => { setEditData(null); setActiveTab('riwayat'); }}
          />
        )}
      </div>
    </div>
  );
};

export default CPPT;