// src/pages/igd/sections/TTVSection.jsx
import React, { useState, useEffect } from 'react';

// Gunakan URL langsung atau import.meta.env (untuk Vite)
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

// Ambil token dari localStorage untuk autentikasi
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const TTVSection = ({ encounterId, encounter, onTTVSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ttvList, setTtvList] = useState([]);
  
  // Form state untuk input TTV baru
  const [form, setForm] = useState({
    systolic: '',
    diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    temperature: '',
    spo2: '',
    weight: '',
    height: ''
  });

  // Fetch riwayat TTV
  useEffect(() => {
    if (encounterId) {
      fetchTTVHistory();
    }
  }, [encounterId]);

  const fetchTTVHistory = async () => {
    setIsLoading(true);
    try {
      // Gunakan API endpoint - langsung pakai URL
      const response = await fetch(
        `${API_URL}/api/igd/encounters/${encounterId}/ttv`,
        { headers: getAuthHeaders() }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setTtvList(result.data || []);
      } else {
        console.error('Fetch TTV error:', result.message);
      }
    } catch (err) {
      console.error('Fetch TTV error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      systolic: '',
      diastolic: '',
      heart_rate: '',
      respiratory_rate: '',
      temperature: '',
      spo2: '',
      weight: '',
      height: ''
    });
  };

  // Save TTV baru via API (akan auto-update SOAP Objective)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi minimal
    if (!form.systolic && !form.diastolic && !form.heart_rate && !form.temperature && !form.spo2) {
      alert('Isi minimal satu tanda vital');
      return;
    }

    setIsSaving(true);

    try {
      // Ambil userData dari localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const response = await fetch(
        `${API_URL}/api/igd/encounters/${encounterId}/ttv`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            systolic: form.systolic || null,
            diastolic: form.diastolic || null,
            heart_rate: form.heart_rate || null,
            respiratory_rate: form.respiratory_rate || null,
            temperature: form.temperature || null,
            spo2: form.spo2 || null,
            weight: form.weight || null,
            height: form.height || null,
            created_by: userData?.id || 1
          })
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        resetForm();
        fetchTTVHistory();
        
        // Panggil callback untuk memberi tahu SOAPSection
        if (onTTVSaved) {
          onTTVSaved(result.data);
        }
        
        alert('✅ Data TTV berhasil disimpan dan SOAP Objective diperbarui');
      } else {
        alert('❌ Gagal menyimpan: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Save TTV error:', err);
      alert('❌ Gagal menyimpan data TTV: ' + (err.message || 'Network error'));
    } finally {
      setIsSaving(false);
    }
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

  // Interpretasi nilai
  const getInterpretation = (type, value) => {
    if (!value) return null;
    
    const interpretations = {
      systolic: value < 90 ? 'Hipotensi' : value > 140 ? 'Hipertensi' : 'Normal',
      diastolic: value < 60 ? 'Hipotensi' : value > 90 ? 'Hipertensi' : 'Normal',
      heart_rate: value < 60 ? 'Bradikardia' : value > 100 ? 'Takikardia' : 'Normal',
      respiratory_rate: value < 12 ? 'Bradipnea' : value > 20 ? 'Takipnea' : 'Normal',
      temperature: value < 36 ? 'Hipotermia' : value > 37.5 ? 'Demam' : 'Normal',
      spo2: value < 90 ? 'Saturasi Rendah' : value < 95 ? 'Saturasi Menurun' : 'Normal'
    };
    
    return interpretations[type];
  };

  const getInterpretationColor = (type, value) => {
    if (!value) return 'text-gray-400';
    if (type === 'systolic') return value < 90 || value > 140 ? 'text-red-600' : 'text-green-600';
    if (type === 'diastolic') return value < 60 || value > 90 ? 'text-red-600' : 'text-green-600';
    if (type === 'heart_rate') return value < 60 || value > 100 ? 'text-red-600' : 'text-green-600';
    if (type === 'respiratory_rate') return value < 12 || value > 20 ? 'text-red-600' : 'text-green-600';
    if (type === 'temperature') return value < 36 || value > 37.5 ? 'text-red-600' : 'text-green-600';
    if (type === 'spo2') return value < 95 ? 'text-red-600' : 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">TTV & Antropometri</h3>
        <p className="text-xs text-gray-500 mt-1">
          Pencatatan Tanda-Tanda Vital dan pengukuran antropometri pasien
        </p>
        <p className="text-xs text-green-600 mt-1">
          💡 Data TTV akan otomatis masuk ke bagian <strong>O (Objective)</strong> di SOAP
        </p>
      </div>

      {/* Form Input TTV */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Input TTV Baru
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tekanan Darah Sistolik
            </label>
            <input
              type="number"
              name="systolic"
              value={form.systolic}
              onChange={handleChange}
              placeholder="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-400">mmHg</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tekanan Darah Diastolik
            </label>
            <input
              type="number"
              name="diastolic"
              value={form.diastolic}
              onChange={handleChange}
              placeholder="80"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-400">mmHg</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nadi / Heart Rate
            </label>
            <input
              type="number"
              name="heart_rate"
              value={form.heart_rate}
              onChange={handleChange}
              placeholder="80"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-400">x/menit</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pernapasan
            </label>
            <input
              type="number"
              name="respiratory_rate"
              value={form.respiratory_rate}
              onChange={handleChange}
              placeholder="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-400">x/menit</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suhu Tubuh
            </label>
            <input
              type="number"
              step="0.1"
              name="temperature"
              value={form.temperature}
              onChange={handleChange}
              placeholder="36.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-400">°C</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saturasi Oksigen (SpO2)
            </label>
            <input
              type="number"
              name="spo2"
              value={form.spo2}
              onChange={handleChange}
              placeholder="98"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Berat Badan
            </label>
            <input
              type="number"
              step="0.1"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="65"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-400">kg</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tinggi Badan
            </label>
            <input
              type="number"
              step="0.1"
              name="height"
              value={form.height}
              onChange={handleChange}
              placeholder="170"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-400">cm</span>
          </div>
        </div>

        {/* BMI Display */}
        {form.weight && form.height && (
          <div className="mt-3 p-2 bg-teal-50 rounded-lg inline-block">
            <span className="text-sm font-medium text-teal-700">
              BMI: {(parseFloat(form.weight) / ((parseFloat(form.height) / 100) ** 2)).toFixed(1)}
            </span>
          </div>
        )}

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
            disabled={isSaving}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Simpan TTV
              </>
            )}
          </button>
        </div>
      </form>

      {/* Riwayat TTV - rest of the code remains the same */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Riwayat TTV</h4>
        
        {isLoading && (
          <div className="text-center py-8">
            <svg className="animate-spin h-6 w-6 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-400 mt-2">Memuat riwayat...</p>
          </div>
        )}

        {!isLoading && ttvList.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400">Belum ada data TTV</p>
            <p className="text-xs text-gray-300 mt-1">Silakan input TTV pertama di form atas</p>
          </div>
        )}

        {!isLoading && ttvList.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {ttvList.map((ttv) => {
              const data = ttv.vital_sign_data;
              return (
                <div key={ttv.vital_signs_id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      {formatTime(ttv.measurement_time)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {data.systolic && data.diastolic && (
                      <div>
                        <span className="text-gray-500">TD:</span>{' '}
                        <span className={getInterpretationColor('systolic', data.systolic)}>
                          {data.systolic}/{data.diastolic} mmHg
                        </span>
                        <span className="text-xs ml-1 text-gray-400">
                          ({getInterpretation('systolic', data.systolic)})
                        </span>
                      </div>
                    )}
                    {data.heart_rate && (
                      <div>
                        <span className="text-gray-500">Nadi:</span>{' '}
                        <span className={getInterpretationColor('heart_rate', data.heart_rate)}>
                          {data.heart_rate} x/mnt
                        </span>
                        <span className="text-xs ml-1 text-gray-400">
                          ({getInterpretation('heart_rate', data.heart_rate)})
                        </span>
                      </div>
                    )}
                    {data.respiratory_rate && (
                      <div>
                        <span className="text-gray-500">Napas:</span>{' '}
                        <span className={getInterpretationColor('respiratory_rate', data.respiratory_rate)}>
                          {data.respiratory_rate} x/mnt
                        </span>
                      </div>
                    )}
                    {data.temperature && (
                      <div>
                        <span className="text-gray-500">Suhu:</span>{' '}
                        <span className={getInterpretationColor('temperature', data.temperature)}>
                          {data.temperature} °C
                        </span>
                      </div>
                    )}
                    {data.spo2 && (
                      <div>
                        <span className="text-gray-500">SpO2:</span>{' '}
                        <span className={getInterpretationColor('spo2', data.spo2)}>
                          {data.spo2}%
                        </span>
                      </div>
                    )}
                    {data.weight && (
                      <div>
                        <span className="text-gray-500">BB:</span> {data.weight} kg
                      </div>
                    )}
                    {data.height && (
                      <div>
                        <span className="text-gray-500">TB:</span> {data.height} cm
                      </div>
                    )}
                    {data.bmi && (
                      <div>
                        <span className="text-gray-500">BMI:</span> {data.bmi}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Informasi Singkat */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700">
          <strong className="font-semibold">📋 Keterangan:</strong><br />
          • TD: Tekanan Darah (Normal: 120/80 mmHg)<br />
          • Nadi (Normal: 60-100 x/menit)<br />
          • Pernapasan (Normal: 12-20 x/menit)<br />
          • Suhu (Normal: 36-37.5°C)<br />
          • SpO2 (Normal: ≥95%)<br />
          • BMI (Normal: 18.5-24.9)
        </p>
      </div>
    </div>
  );
};

export default TTVSection;