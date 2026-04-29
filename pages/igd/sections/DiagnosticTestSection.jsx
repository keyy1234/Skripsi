// src/pages/igd/sections/DiagnosticTestSection.jsx
import React, { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Lab catalog ───────────────────────────────────────────────────────
const LAB_CATALOG = [
  { group: 'HEMATOLOGI', items: ['Hemoglobin', 'Leukosit', 'Trombosit', 'Hematokrit', 'LED', 'Differential Count', 'APUSAN DARAH TEPI'] },
  { group: 'KIMIA KLINIK', items: ['SGOT', 'SGPT', 'UREUM', 'KREATININ', 'GULA DARAH SEWAKTU', 'GULA DARAH PUASA', 'GULA DARAH 2 JAM PP', 'HbA1c', 'ASAM URAT', 'KOLESTEROL TOTAL', 'HDL', 'LDL', 'TRIGLISERIDA'] },
  { group: 'URINALISIS', items: ['URIN RUTIN', 'URIN LENGKAP', 'PROTEIN URIN', 'ALBUMIN URIN', 'KULTUR URIN'] },
  { group: 'SEROLOGI', items: ['WIDAL', 'HBsAg', 'Anti HCV', 'Anti HIV', 'Dengue NS1', 'IgG', 'IgM', 'Rapid Test COVID-19'] },
  { group: 'ELEKTROLIT', items: ['NATRIUM', 'KALIUM', 'KLORIDA', 'KALSIUM', 'MAGNESIUM', 'FOSFOR'] },
  { group: 'HORMON', items: ['TSH', 'FT3', 'FT4', 'PROLAKTIN', 'TESTOSTERON', 'ESTRADIOL', 'PROGESTERON'] },
  { group: 'LAINNYA', items: ['Tes Coombs direk', 'Tes Coombs indirek', 'Laktat Dehidrogenase', 'CPK', 'Troponin'] },
];

const RADIOLOGI_CATALOG = [
  { group: 'FOTO POLOS', items: ['Foto Thorax PA', 'Foto Thorax AP', 'Foto Abdomen 3 Posisi', 'Foto Kepala', 'Foto Tulang Belakang Cervical', 'Foto Tulang Belakang Lumbal', 'Foto Ekstremitas'] },
  { group: 'USG', items: ['USG Abdomen', 'USG Pelvis', 'USG Ginjal', 'USG Jantung (Echo)', 'USG Tiroid', 'USG Payudara', 'USG Transvaginal', 'USG Prostat'] },
  { group: 'CT SCAN', items: ['CT Scan Kepala Non Kontras', 'CT Scan Kepala + Kontras', 'CT Scan Thorax', 'CT Scan Abdomen', 'CT Scan Pelvis', 'CT Scan Tulang Belakang'] },
  { group: 'MRI', items: ['MRI Kepala', 'MRI Tulang Belakang Lumbal', 'MRI Tulang Belakang Servikal', 'MRI Sendi', 'MRI Abdomen'] },
  { group: 'MAMOGRAFI', items: ['Mamografi Screening', 'Mamografi Diagnostik', 'USG Payudara'] },
  { group: 'INTERVENSI', items: ['Biopsi', 'Aspirasi', 'Pemasangan PICC Line'] },
];

// ── Search dropdown component ─────────────────────────────────────────
const SearchDropdown = ({ catalog, selected, onSelect, placeholder }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.length >= 1
    ? catalog.map(g => ({ ...g, items: g.items.filter(i => i.toLowerCase().includes(query.toLowerCase())) })).filter(g => g.items.length > 0)
    : catalog;

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 bg-white">
        <svg className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
        />
        <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-400 text-center">Tidak ditemukan</div>
          ) : (
            filtered.map(group => (
              <div key={group.group}>
                <div className="px-4 py-2 bg-gradient-to-r from-teal-50 to-white border-b border-gray-100 sticky top-0">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">{group.group}</p>
                </div>
                {group.items.map(item => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => { onSelect(item); setOpen(false); setQuery(''); }}
                      className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-50 last:border-0 transition-all ${
                        isSelected ? 'bg-teal-500 text-white font-medium' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────
const DiagnosticTestSection = ({ encounterId, encounter }) => {
  const [activeTab, setActiveTab] = useState('lab');
  const [selectedItems, setSelectedItems] = useState([]);
  const [dataKlinis, setDataKlinis] = useState('');
  const [catatan, setCatatan] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [medicProfilesList, setMedicProfilesList] = useState([]);
  const [testsHistory, setTestsHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Get token
  const getToken = () => localStorage.getItem('token');

  // Fetch with auth
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

  // Get current catalog based on active tab
  const currentCatalog = activeTab === 'lab' ? LAB_CATALOG : RADIOLOGI_CATALOG;
  const testType = activeTab === 'lab' ? 'LAB' : 'RADIOLOGY';

  // Fetch daftar dokter
  const fetchMedicProfiles = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/medic-staff`);
      if (data.success) {
        const doctors = data.data.filter(p => p.role === 'dokter_dpjp' || p.role === 'dokter_umum');
        setMedicProfilesList(doctors);
      }
    } catch (err) {
      console.error('Fetch staff error:', err);
    }
  };

  // Fetch riwayat pemeriksaan
  const fetchTestsHistory = async () => {
    if (!encounterId) return;
    
    setIsLoadingHistory(true);
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/penunjang/${encounterId}`);
      if (data.success) {
        // Filter berdasarkan tab yang aktif
        const filtered = data.data.filter(test => test.test_type === testType);
        setTestsHistory(filtered);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Toggle item selection
  const toggleItem = (item) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  // Add item from search
  const addItem = (item) => {
    if (!selectedItems.includes(item)) {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  // Update catatan untuk item tertentu
  const updateCatatan = (item, value) => {
    setCatatan(prev => ({ ...prev, [item]: value }));
  };

  // Reset form
  const resetForm = () => {
    setSelectedItems([]);
    setDataKlinis('');
    setCatatan({});
    setError('');
  };

  // Save permission
  const handleSave = async () => {
    if (selectedItems.length === 0) {
      setError('Pilih minimal satu pemeriksaan');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Simpan setiap item sebagai diagnostic test terpisah
      let successCount = 0;
      let errorCount = 0;

      for (const item of selectedItems) {
        const testName = item;
        const notes = dataKlinis + (catatan[item] ? `\nCatatan: ${catatan[item]}` : '');

        const result = await fetchWithAuth(`${API_URL}/api/igd/penunjang`, {
          method: 'POST',
          body: JSON.stringify({
            encounter_id: parseInt(encounterId),
            test_type: testType,
            test_name: testName,
            requested_by: medicProfilesList[0]?.id || null,
            notes: notes
          })
        });

        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Failed to save ${item}:`, result.message);
        }
      }

      if (successCount > 0) {
        setSuccess(`${successCount} pemeriksaan berhasil disimpan${errorCount > 0 ? `, ${errorCount} gagal` : ''}`);
        resetForm();
        fetchTestsHistory();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Gagal menyimpan pemeriksaan');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  // Update status test
  const updateStatus = async (testId, newStatus) => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/penunjang/${testId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (data.success) {
        fetchTestsHistory();
        alert(`Status berhasil diupdate`);
      } else {
        alert(data.message || 'Gagal update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('Gagal update status');
    }
  };

  // Delete test
  const handleDelete = async (testId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pemeriksaan ini?')) return;
    
    try {
      const data = await fetchWithAuth(`${API_URL}/api/igd/penunjang/${testId}`, {
        method: 'DELETE'
      });
      
      if (data.success) {
        fetchTestsHistory();
        alert('Pemeriksaan berhasil dihapus');
      } else {
        alert(data.message || 'Gagal menghapus pemeriksaan');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Gagal menghapus pemeriksaan');
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      'REQUESTED': 'Diminta',
      'COLLECTED': 'Sampel Diambil',
      'PROCESSING': 'Diproses',
      'COMPLETED': 'Selesai',
      'CANCELLED': 'Dibatalkan'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'REQUESTED': 'bg-yellow-100 text-yellow-700',
      'COLLECTED': 'bg-blue-100 text-blue-700',
      'PROCESSING': 'bg-purple-100 text-purple-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-gray-100 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  // Format waktu
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

  // Initial load
  useEffect(() => {
    if (encounterId) {
      fetchMedicProfiles();
      fetchTestsHistory();
    }
  }, [encounterId, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">Pemeriksaan Penunjang</h3>
        <p className="text-xs text-gray-500 mt-1">
          Permintaan pemeriksaan Laboratorium dan Radiologi
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <button
          onClick={() => setActiveTab('lab')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-t-lg ${
            activeTab === 'lab'
              ? 'border-b-2 border-teal-500 text-teal-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Laboratorium
        </button>
        <button
          onClick={() => setActiveTab('radiologi')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-t-lg ${
            activeTab === 'radiologi'
              ? 'border-b-2 border-teal-500 text-teal-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Radiologi
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`ml-auto flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
            showHistory ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {showHistory ? 'Sembunyikan Riwayat' : 'Lihat Riwayat'}
        </button>
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

      {/* Form Permintaan */}
      <div className="space-y-6">
        {/* Data Klinis */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Data Klinis Pasien
          </label>
          <textarea
            value={dataKlinis}
            onChange={e => setDataKlinis(e.target.value)}
            placeholder="Masukkan data klinis pasien (keluhan, gejala, indikasi pemeriksaan)..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: search + catalog */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cari Pemeriksaan
              </label>
              <SearchDropdown
                catalog={currentCatalog}
                selected={selectedItems}
                onSelect={addItem}
                placeholder={`Cari pemeriksaan ${activeTab === 'lab' ? 'laboratorium' : 'radiologi'}...`}
              />
            </div>
            
            {/* Catalog list */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Daftar Pemeriksaan
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto bg-white">
                {currentCatalog.map(group => (
                  <div key={group.group}>
                    <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 sticky top-0">
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">{group.group}</p>
                    </div>
                    {group.items.map(item => {
                      const isSelected = selectedItems.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggleItem(item)}
                          className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-50 last:border-0 transition-all flex items-center justify-between group ${
                            isSelected ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-teal-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                            {item}
                          </span>
                          {!isSelected && (
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: selected items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                Pemeriksaan Dipilih
              </label>
              <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">
                {selectedItems.length} item
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden min-h-[300px] bg-white">
              {selectedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                  </svg>
                  <p className="text-sm">Belum ada pemeriksaan dipilih</p>
                  <p className="text-xs mt-1">Klik pemeriksaan dari daftar kiri untuk menambah</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {selectedItems.map(item => (
                    <div key={item} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item}</p>
                        <textarea
                          placeholder="Catatan khusus untuk pemeriksaan ini (opsional)..."
                          value={catatan[item] || ''}
                          onChange={e => updateCatatan(item, e.target.value)}
                          rows={2}
                          className="mt-1 w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none"
                        />
                      </div>
                      <button
                        onClick={() => toggleItem(item)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition flex-shrink-0"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedItems.length > 0 && (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-sm font-semibold rounded-lg hover:from-teal-700 hover:to-teal-600 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
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
                      Simpan Permintaan
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Riwayat Pemeriksaan */}
      {showHistory && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Riwayat Pemeriksaan {activeTab === 'lab' ? 'Laboratorium' : 'Radiologi'} ({testsHistory.length})
          </h4>
          
          {isLoadingHistory && (
            <div className="text-center py-8">
              <svg className="animate-spin h-6 w-6 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-gray-400 mt-2">Memuat riwayat...</p>
            </div>
          )}

          {!isLoadingHistory && testsHistory.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-400">Belum ada riwayat pemeriksaan</p>
            </div>
          )}

          {!isLoadingHistory && testsHistory.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {testsHistory.map((test) => (
                <div key={test.test_id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(test.status)}`}>
                        {getStatusLabel(test.status)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(test.requested_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {test.status !== 'COMPLETED' && test.status !== 'CANCELLED' && (
                        <>
                          {test.status === 'REQUESTED' && (
                            <button
                              onClick={() => updateStatus(test.test_id, 'COLLECTED')}
                              className="p-1 text-blue-500 hover:text-blue-700"
                              title="Ambil Sampel"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16" />
                              </svg>
                            </button>
                          )}
                          {test.status === 'COLLECTED' && (
                            <button
                              onClick={() => updateStatus(test.test_id, 'PROCESSING')}
                              className="p-1 text-purple-500 hover:text-purple-700"
                              title="Mulai Proses"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(test.test_id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-800">{test.test_name}</p>
                  
                  {test.notes && (
                    <p className="text-xs text-gray-500 mt-1">📝 {test.notes}</p>
                  )}
                  
                  {test.result && (
                    <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Hasil:</p>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                        {typeof test.result === 'object' ? JSON.stringify(test.result, null, 2) : test.result}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Informasi Singkat */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700">
          <strong className="font-semibold">📋 Alur Pemeriksaan Penunjang:</strong><br />
          1. Pilih pemeriksaan dari daftar atau cari menggunakan kotak pencarian<br />
          2. Tambahkan catatan khusus jika diperlukan<br />
          3. Klik "Simpan Permintaan" untuk mengirim ke laboratorium/radiologi<br />
          4. Status akan berubah seiring proses pemeriksaan berjalan
        </p>
      </div>
    </div>
  );
};

export default DiagnosticTestSection;