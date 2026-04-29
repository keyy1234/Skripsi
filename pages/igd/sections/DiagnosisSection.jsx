// src/pages/igd/sections/DiagnosisSection.jsx
import React, { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DiagnosisSection = ({ encounterId, encounter }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [medicProfilesList, setMedicProfilesList] = useState([]);
  const [icd10List, setIcd10List] = useState([]);
  const [searchIcd, setSearchIcd] = useState('');
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    icd10_code: '',
    diagnosis_name: '',
    notes: '',
    diagnosed_by: '',
    is_primary: false
  });

  // Validasi encounterId
  const getValidEncounterId = useCallback(() => {
    if (!encounterId) return null;
    if (encounterId === 'NaN' || encounterId === 'undefined' || encounterId === 'null') {
      console.warn('Invalid encounterId value:', encounterId);
      return null;
    }
    const parsed = parseInt(encounterId);
    if (isNaN(parsed)) {
      console.warn('Cannot parse encounterId:', encounterId);
      return null;
    }
    return parsed;
  }, [encounterId]);

  const validEncounterId = getValidEncounterId();

  const getToken = () => localStorage.getItem('token');

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = getToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  }, []);

  const fetchMedicProfiles = useCallback(async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/medic-staff`);
      if (data.success) {
        const doctors = data.data.filter(p => p.role === 'dokter_dpjp' || p.role === 'dokter_umum');
        setMedicProfilesList(doctors);
      }
    } catch (err) {
      console.error('Fetch staff error:', err);
    }
  }, [fetchWithAuth]);

  const fetchIcd10Codes = useCallback(async (search = '') => {
    try {
      let url = `${API_URL}/api/igd/diagnosis/icd10`;
      if (search && search.length >= 2) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const data = await fetchWithAuth(url);
      if (data.success) {
        setIcd10List(data.data || []);
      }
    } catch (err) {
      console.error('Fetch ICD-10 error:', err);
      // Jangan set error state, cukup log
    }
  }, [fetchWithAuth]);

  const fetchDiagnosisHistory = useCallback(async () => {
    const id = getValidEncounterId();
    if (!id) {
      console.warn('❌ Skipping fetch - invalid encounterId');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/diagnosis/${id}`);
      if (data.success) {
        setDiagnosisList(data.data || []);
      } else {
        setError(data.message || 'Gagal mengambil data diagnosis');
      }
    } catch (err) {
      console.error('Fetch diagnosis error:', err);
      setError('Gagal mengambil data diagnosis');
    } finally {
      setIsLoading(false);
    }
  }, [getValidEncounterId, fetchWithAuth]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handlePrimaryChange = (e) => {
    setForm({ ...form, is_primary: e.target.checked });
  };

  const handleSelectIcd = (icd) => {
    setForm({
      ...form,
      icd10_code: icd.code,
      diagnosis_name: icd.description
    });
    setSearchIcd(`${icd.code} - ${icd.description}`);
    setShowIcdDropdown(false);
  };

  const handleSearchIcd = async (e) => {
    const value = e.target.value;
    setSearchIcd(value);
    setShowIcdDropdown(true);
    
    if (!value) {
      setForm({ ...form, icd10_code: '', diagnosis_name: '' });
      setIcd10List([]);
      return;
    }
    
    if (value.length >= 2) {
      await fetchIcd10Codes(value);
    }
  };

  const resetForm = () => {
    setForm({
      icd10_code: '',
      diagnosis_name: '',
      notes: '',
      diagnosed_by: '',
      is_primary: false
    });
    setSearchIcd('');
    setIcd10List([]);
    setShowIcdDropdown(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const id = getValidEncounterId();
    if (!id) {
      setError('Data encounter tidak valid. Silakan refresh halaman.');
      return;
    }
    
    if (!form.icd10_code && !form.diagnosis_name) {
      setError('Pilih kode ICD-10 atau isi nama diagnosis');
      return;
    }
    if (!form.diagnosed_by) {
      setError('Pilih dokter yang mendiagnosis');
      return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/diagnosis`, {
        method: 'POST',
        body: JSON.stringify({
          encounter_id: id,
          icd10_code: form.icd10_code || null,
          diagnosis_name: form.diagnosis_name,
          notes: form.notes || null,
          diagnosed_by: form.diagnosed_by,
          is_primary: form.is_primary
        })
      });

      if (data.success) {
        setSuccess('Diagnosis berhasil disimpan');
        resetForm();
        await fetchDiagnosisHistory();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Gagal menyimpan diagnosis');
      }
    } catch (err) {
      console.error('Save diagnosis error:', err);
      setError('Terjadi kesalahan saat menyimpan diagnosis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (diagnosisId) => {
    if (!confirm('Yakin ingin menghapus diagnosis ini?')) return;
    
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/diagnosis/${diagnosisId}`, {
        method: 'DELETE'
      });
      
      if (data.success) {
        setSuccess('Diagnosis berhasil dihapus');
        await fetchDiagnosisHistory();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Gagal menghapus diagnosis');
      }
    } catch (err) {
      console.error('Delete diagnosis error:', err);
      setError('Terjadi kesalahan saat menghapus diagnosis');
    }
  };

  const handleSetPrimary = async (diagnosisId) => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/diagnosis/${diagnosisId}/primary`, {
        method: 'PATCH'
      });
      
      if (data.success) {
        setSuccess('Diagnosis utama berhasil diubah');
        await fetchDiagnosisHistory();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Gagal mengubah diagnosis utama');
      }
    } catch (err) {
      console.error('Set primary error:', err);
      setError('Terjadi kesalahan saat mengubah diagnosis utama');
    }
  };

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

  const getCategoryBadge = (category) => {
    const colors = {
      'Kardiovaskular': 'bg-red-100 text-red-700',
      'Respirasi': 'bg-blue-100 text-blue-700',
      'Pencernaan': 'bg-yellow-100 text-yellow-700',
      'Infeksi': 'bg-purple-100 text-purple-700',
      'Neurologi': 'bg-indigo-100 text-indigo-700',
      'Metabolik': 'bg-orange-100 text-orange-700',
      'Muskuloskeletal': 'bg-green-100 text-green-700',
      'Urologi': 'bg-cyan-100 text-cyan-700',
      'Gejala': 'bg-gray-100 text-gray-700',
      'Cedera': 'bg-pink-100 text-pink-700',
      'Faktor kesehatan': 'bg-teal-100 text-teal-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  // Initial load
  useEffect(() => {
    const id = getValidEncounterId();
    if (id) {
      fetchDiagnosisHistory();
      fetchMedicProfiles();
    }
    fetchIcd10Codes();
  }, [encounterId, getValidEncounterId, fetchDiagnosisHistory, fetchMedicProfiles, fetchIcd10Codes]);

  const filteredIcd10 = icd10List.filter(icd => 
    icd.code?.toLowerCase().includes(searchIcd.toLowerCase()) ||
    icd.description?.toLowerCase().includes(searchIcd.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">Diagnosis</h3>
        <p className="text-xs text-gray-500 mt-1">
          Pencatatan diagnosis berdasarkan kode ICD-10 (International Classification of Diseases)
        </p>
        {!validEncounterId && (
          <p className="text-xs text-red-500 mt-2">
            ⚠️ Data encounter tidak valid. ID: {String(encounterId)}
          </p>
        )}
      </div>

      {/* Error & Success Messages */}
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

      {/* Form Input Diagnosis */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Tambah Diagnosis
        </h4>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Pilih Kode ICD-10 */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode ICD-10 / Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={searchIcd}
              onChange={handleSearchIcd}
              onFocus={() => setShowIcdDropdown(true)}
              placeholder="Cari kode ICD-10 atau nama diagnosis..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
              disabled={!validEncounterId}
            />
            {showIcdDropdown && filteredIcd10.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredIcd10.map((icd) => (
                  <button
                    key={icd.code}
                    type="button"
                    onClick={() => handleSelectIcd(icd)}
                    className="w-full text-left px-4 py-2 hover:bg-teal-50 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-teal-600">{icd.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getCategoryBadge(icd.category)}`}>
                        {icd.category || 'Lainnya'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{icd.description}</p>
                  </button>
                ))}
              </div>
            )}
            {form.icd10_code && (
              <p className="text-xs text-green-600 mt-1">
                Terpilih: {form.icd10_code} - {form.diagnosis_name}
              </p>
            )}
          </div>

          {/* Catatan Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan Diagnosis
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Informasi tambahan tentang diagnosis (opsional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
              disabled={!validEncounterId}
            />
          </div>

          {/* Diagnosis Utama Checkbox */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_primary}
                onChange={handlePrimaryChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                disabled={!validEncounterId}
              />
              <span className="text-sm font-medium text-gray-700">
                Jadikan Diagnosis Utama (Primary)
              </span>
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Hanya satu diagnosis yang dapat menjadi diagnosis utama
            </p>
          </div>

          {/* Dokter Pendiagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dokter Pendiagnosis <span className="text-red-500">*</span>
            </label>
            <select
              name="diagnosed_by"
              value={form.diagnosed_by}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
              disabled={!validEncounterId}
            >
              <option value="">-- Pilih Dokter --</option>
              {medicProfilesList.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.role === 'dokter_dpjp' ? 'Spesialis' : 'Umum'})
                  {staff.specialization && ` - ${staff.specialization}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving || !validEncounterId}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              'Simpan Diagnosis'
            )}
          </button>
        </div>
      </form>

      {/* Riwayat Diagnosis */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Riwayat Diagnosis ({diagnosisList.length})
        </h4>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Memuat riwayat...</p>
          </div>
        )}

        {!isLoading && diagnosisList.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400">Belum ada diagnosis</p>
            <p className="text-xs text-gray-300 mt-1">Silakan input diagnosis pertama di form atas</p>
          </div>
        )}

        {!isLoading && diagnosisList.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {diagnosisList.map((diagnosis) => (
              <div 
                key={diagnosis.diagnosis_id} 
                className={`border rounded-lg p-3 transition ${
                  diagnosis.is_primary 
                    ? 'border-teal-300 bg-teal-50/30' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      {diagnosis.icd10_code || diagnosis.diagnosis_code || '-'}
                    </span>
                    {diagnosis.is_primary && (
                      <span className="text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-700">
                        ⭐ Diagnosis Utama
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(diagnosis.diagnosed_at)}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-gray-800">
                  {diagnosis.diagnosis_name || '-'}
                </p>
                
                {diagnosis.notes && (
                  <p className="text-sm text-gray-600 mt-1 bg-gray-100 p-2 rounded">
                    📝 {diagnosis.notes}
                  </p>
                )}
                
                <div className="mt-2 flex justify-between items-center text-xs">
                  <span className="text-gray-400">
                    Diagnosed by: {diagnosis.diagnosed_by_profile?.name || '-'}
                  </span>
                  <div className="flex gap-2">
                    {!diagnosis.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(diagnosis.diagnosis_id)}
                        className="text-teal-600 hover:text-teal-700 px-2 py-1 rounded hover:bg-teal-50 transition"
                        title="Jadikan diagnosis utama"
                      >
                        Jadikan Utama
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(diagnosis.diagnosis_id)}
                      className="text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                      title="Hapus diagnosis"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informasi Singkat ICD-10 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700">
          <strong className="font-semibold">📋 Tentang Kode ICD-10:</strong><br />
          ICD-10 adalah sistem klasifikasi penyakit internasional yang diterbitkan oleh WHO.
          Setiap diagnosis diberi kode unik untuk standarisasi pelaporan medis dan klaim BPJS.
          <br /><br />
          <strong>Contoh kode umum di IGD:</strong><br />
          • I10 - Hipertensi Esensial<br />
          • J06.9 - Infeksi saluran pernapasan atas akut<br />
          • K35.8 - Appendisitis akut<br />
          • R50.9 - Demam
          <br /><br />
          <strong>💡 Tips:</strong> Diagnosis yang ditandai ⭐ (Utama) akan otomatis masuk ke catatan SOAP bagian Assessment.
        </p>
      </div>
    </div>
  );
};

export default DiagnosisSection;