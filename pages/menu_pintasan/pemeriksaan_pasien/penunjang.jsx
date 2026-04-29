import React, { useState, useRef, useEffect } from 'react';
import ToastNotification from '../../../components/ToastNotification';
import { useBlockchainNotification } from '../../../context/BlockchainNotificationContext';

const API_URL = 'http://localhost:5000';

// ── Lab catalog ───────────────────────────────────────────────────────
const LAB_CATALOG = [
  { group: 'HEMATOLOGI', items: ['Hemoglobin', 'Leukosit', 'Trombosit', 'Hematokrit', 'LED', 'Differential Count', 'APUSAN DARAH TEPI'] },
  { group: 'KIMIA KLINIK', items: ['SGOT', 'SGPT', 'UREUM', 'KREATININ', 'GULA DARAH SEWAKTU', 'GULA DARAH PUASA', 'GULA DARAH 2 JAM PP', 'HbA1c', 'ASAM URAT', 'KOLESTEROL TOTAL', 'HDL', 'LDL', 'TRIGLISERIDA'] },
  { group: 'URINALISIS', items: ['URIN RUTIN', 'URIN LENGKAP', 'PROTEIN URIN', 'ALBUMIN URIN', 'KULTUR URIN'] },
  { group: 'SEROLOGI', items: ['WIDAL', 'HBsAg', 'Anti HCV', 'Anti HIV', 'Dengue NS1', 'IgG', 'IgM', 'Rapid Test COVID-19'] },
  { group: 'ELEKTROLIT', items: ['NATRIUM', 'KALIUM', 'KLORIDA', 'KALSIUM', 'MAGNESIUM', 'FOSFOR'] },
  { group: 'HORMON', items: ['TSH', 'FT3', 'FT4', 'PROLAKTIN', 'TESTOSTERON', 'ESTRADIOL', 'PROGESTERON'] },
  { group: 'LAINNYA', items: ['Tes Coombs direk', 'Tes Coombs indirek', 'LED', 'Laktat Dehidrogenase', 'CPK', 'Troponin'] },
];

const RADIOLOGI_CATALOG = [
  { group: 'FOTO POLOS', items: ['Foto Thorax PA', 'Foto Thorax AP', 'Foto Abdomen 3 Posisi', 'Foto Kepala', 'Foto Tulang Belakang Cervical', 'Foto Tulang Belakang Lumbal', 'Foto Ekstremitas'] },
  { group: 'USG', items: ['USG Abdomen', 'USG Pelvis', 'USG Ginjal', 'USG Jantung (Echo)', 'USG Tiroid', 'USG Payudara', 'USG Transvaginal', 'USG Prostat'] },
  { group: 'CT SCAN', items: ['CT Scan Kepala Non Kontras', 'CT Scan Kepala + Kontras', 'CT Scan Thorax', 'CT Scan Abdomen', 'CT Scan Pelvis', 'CT Scan Tulang Belakang'] },
  { group: 'MRI', items: ['MRI Kepala', 'MRI Tulang Belakang Lumbal', 'MRI Tulang Belakang Servikal', 'MRI Sendi', 'MRI Abdomen'] },
  { group: 'MAMOGRAFI', items: ['Mamografi Screening', 'Mamografi Diagnostik', 'USG Payudara'] },
  { group: 'INTERVENSI', items: ['Biopsi', 'Aspirasi', 'Pemasangan PICC Line'] },
];

// ── Search dropdown ───────────────────────────────────────────────────
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
          {filtered.map(group => (
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
          ))}
        </div>
      )}
    </div>
  );
};

// ── Penunjang panel ───────────────────────────────────────────────────
const PenunjangPanel = ({ catalog, jenis, patient, onSaveSuccess }) => {
  const [selected, setSelected] = useState([]);
  const [dataKlinis, setDataKlinis] = useState('');
  const [catatan, setCatatan] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const token = localStorage.getItem('token');
  const { showBlockchainNotification, updateBlockchainNotification } = useBlockchainNotification();

  const toggleItem = (item) => {
    setSelected(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const addItem = (item) => {
    if (!selected.includes(item)) {
      setSelected(prev => [...prev, item]);
    }
  };

  const updateCatatan = (item, value) => {
    setCatatan(prev => ({ ...prev, [item]: value }));
  };

  const resetForm = () => {
    setSelected([]);
    setDataKlinis('');
    setCatatan({});
    setError('');
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      setError('Pilih minimal satu pemeriksaan');
      return;
    }

    setIsSaving(true);
    setError('');
    
    showBlockchainNotification('pending', null, `Menyimpan permintaan ${jenis === 'lab' ? 'Laboratorium' : 'Radiologi'}...`);

    try {
      const patientId = patient?.patient_id || patient?.pasien?.id || patient?.id;
      
      const payload = {
        patient_id: patientId,
        admisi_id: patient?.id,
        no_registrasi: patient?.no_registrasi,
        jenis: jenis === 'lab' ? 'laboratorium' : 'radiologi',
        data_klinis: dataKlinis,
        pemeriksaan_list: selected,
        catatan: catatan,
        notes: `Dibuat melalui sistem RME - ${new Date().toLocaleString()}`
      };

      const response = await fetch(`${API_URL}/api/penunjang`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        updateBlockchainNotification('success', null, `Permintaan ${jenis === 'lab' ? 'Laboratorium' : 'Radiologi'} berhasil disimpan!`);
        setSuccess('Permintaan berhasil disimpan!');
        resetForm();
        if (onSaveSuccess) onSaveSuccess();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        updateBlockchainNotification('error', null, result.message || 'Gagal menyimpan');
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
    <div className="space-y-6">
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

      {/* Data Klinis */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Data Klinis Pasien
        </label>
        <textarea
          value={dataKlinis}
          onChange={e => setDataKlinis(e.target.value)}
          placeholder="Masukkan data klinis pasien (keluhan, gejala, dll)..."
          rows={3}
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
              catalog={catalog}
              selected={selected}
              onSelect={addItem}
              placeholder={`Cari pemeriksaan ${jenis === 'lab' ? 'laboratorium' : 'radiologi'}...`}
            />
          </div>
          
          {/* Catalog list */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Daftar Pemeriksaan
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto bg-white">
              {catalog.map(group => (
                <div key={group.group}>
                  <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 sticky top-0">
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">{group.group}</p>
                  </div>
                  {group.items.map(item => {
                    const isSelected = selected.includes(item);
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
              {selected.length} item
            </span>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden min-h-[200px] bg-white">
            {selected.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
                <p className="text-sm">Belum ada pemeriksaan dipilih</p>
                <p className="text-xs mt-1">Klik pemeriksaan dari daftar kiri untuk menambah</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {selected.map(item => (
                  <div key={item} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item}</p>
                      <textarea
                        placeholder="Catatan (opsional)..."
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

          {selected.length > 0 && (
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
  );
};

// ── Main page ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'lab', label: 'Laboratorium', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { id: 'radiologi', label: 'Radiologi', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

const Penunjang = ({ patient }) => {
  const [activeTab, setActiveTab] = useState('lab');
  const [refreshKey, setRefreshKey] = useState(0);

  if (!patient) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
        <p className="text-gray-500">Tidak ada data pasien</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-teal-500 text-teal-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'lab' && (
          <PenunjangPanel 
            catalog={LAB_CATALOG} 
            jenis="lab" 
            patient={patient}
            onSaveSuccess={() => setRefreshKey(prev => prev + 1)}
          />
        )}
        {activeTab === 'radiologi' && (
          <PenunjangPanel 
            catalog={RADIOLOGI_CATALOG} 
            jenis="radiologi" 
            patient={patient}
            onSaveSuccess={() => setRefreshKey(prev => prev + 1)}
          />
        )}
      </div>
    </div>
  );
};

export default Penunjang;