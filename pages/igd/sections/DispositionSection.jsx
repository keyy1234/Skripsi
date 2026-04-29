// src/pages/igd/sections/DispositionSection.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const DispositionSection = ({ encounterId, encounter, onDispositionComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [disposition, setDisposition] = useState(null);
  const [medicStaffList, setMedicStaffList] = useState([]);
  
  // Form state untuk disposisi
  const [form, setForm] = useState({
    status: '',
    discharge_summary: '',
    follow_up_instructions: '',
    authorized_by: ''
  });

  // Ambil daftar staff (dokter)
  useEffect(() => {
    fetchMedicStaff();
  }, []);

  // Fetch data disposisi yang sudah ada
  useEffect(() => {
    if (encounterId) {
      fetchDisposition();
    }
  }, [encounterId]);

  const fetchMedicStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('medic_staff')
        .select('staff_id, staff_name, role, specialization')
        .eq('role', 'DOCTOR')
        .order('staff_name');

      if (error) throw error;
      setMedicStaffList(data || []);
    } catch (err) {
      console.error('Fetch staff error:', err);
    }
  };

  const fetchDisposition = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dispositions')
        .select(`
          *,
          created_by_staff:created_by (
            staff_id,
            staff_name
          ),
          authorized_by_staff:authorized_by (
            staff_id,
            staff_name
          )
        `)
        .eq('encounter_id', encounterId)
        .maybeSingle();  // maybeSingle agar tidak error jika tidak ada data

      if (error) throw error;
      
      if (data) {
        setDisposition(data);
        setForm({
          status: data.status,
          discharge_summary: data.discharge_summary || '',
          follow_up_instructions: data.follow_up_instructions || '',
          authorized_by: data.authorized_by || ''
        });
      }
    } catch (err) {
      console.error('Fetch disposition error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Update status encounter di tabel encounters
  const updateEncounterStatus = async (status) => {
    const encounterStatus = status === 'HOME' ? 'DISCHARGED' : 
                            status === 'ADMITTED' ? 'ADMITTED' : 
                            status === 'TRANSFER' ? 'DISCHARGED' : 'DISCHARGED';
    
    const { error } = await supabase
      .from('encounters')
      .update({ 
        status: encounterStatus,
        encounter_end_time: new Date()
      })
      .eq('encounter_id', encounterId);

    if (error) throw error;
  };

  // Save disposisi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!form.status) {
      alert('Pilih status disposisi');
      return;
    }
    if (!form.authorized_by) {
      alert('Pilih dokter yang mengotorisasi');
      return;
    }

    setIsSaving(true);
    try {
      if (disposition) {
        // Update disposisi yang sudah ada
        const { error } = await supabase
          .from('dispositions')
          .update({
            status: form.status,
            discharge_summary: form.discharge_summary,
            follow_up_instructions: form.follow_up_instructions,
            authorized_by: parseInt(form.authorized_by),
            updated_by: parseInt(form.authorized_by),
            updated_at: new Date()
          })
          .eq('disposition_id', disposition.disposition_id);

        if (error) throw error;
      } else {
        // Insert disposisi baru
        const { error } = await supabase
          .from('dispositions')
          .insert([{
            encounter_id: encounterId,
            status: form.status,
            discharge_summary: form.discharge_summary,
            follow_up_instructions: form.follow_up_instructions,
            created_by: parseInt(form.authorized_by),
            authorized_by: parseInt(form.authorized_by),
            disposition_time: new Date()
          }]);

        if (error) throw error;
      }

      // Update status encounter berdasarkan disposisi
      await updateEncounterStatus(form.status);
      
      alert(`Disposisi berhasil disimpan. Status pasien: ${getStatusLabel(form.status)}`);
      
      // Refresh data
      fetchDisposition();
      
      // Panggil callback jika disediakan (untuk refresh data di parent)
      if (onDispositionComplete) {
        onDispositionComplete();
      }
      
    } catch (err) {
      console.error('Save disposition error:', err);
      alert('Gagal menyimpan disposisi');
    } finally {
      setIsSaving(false);
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      'HOME': 'Pulang ke Rumah',
      'ADMITTED': 'Dirujuk ke Rawat Inap',
      'TRANSFER': 'Rujuk ke RS Lain',
      'DECEASED': 'Meninggal'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'HOME': 'bg-green-100 text-green-700 border-green-200',
      'ADMITTED': 'bg-blue-100 text-blue-700 border-blue-200',
      'TRANSFER': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'DECEASED': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'HOME': '🏠',
      'ADMITTED': '🏥',
      'TRANSFER': '🚑',
      'DECEASED': '⚫'
    };
    return icons[status] || '📋';
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

  // Status options untuk radio button
  const statusOptions = [
    { value: 'HOME', label: '🏠 Pulang ke Rumah', description: 'Pasien diperbolehkan pulang dengan kondisi membaik' },
    { value: 'ADMITTED', label: '🏥 Dirujuk ke Rawat Inap', description: 'Pasien memerlukan perawatan lanjutan di rawat inap' },
    { value: 'TRANSFER', label: '🚑 Rujuk ke RS Lain', description: 'Pasien dirujuk ke fasilitas kesehatan lain' },
    { value: 'DECEASED', label: '⚫ Meninggal', description: 'Pasien meninggal dunia' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">Disposisi Pasien</h3>
        <p className="text-xs text-gray-500 mt-1">
          Penentuan status akhir pasien setelah perawatan di IGD
        </p>
      </div>

      {/* Jika sudah ada disposisi, tampilkan ringkasan */}
      {disposition && (
        <div className={`border rounded-xl p-4 ${getStatusColor(disposition.status)} bg-opacity-50`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getStatusIcon(disposition.status)}</span>
            <span className="font-semibold text-lg">{getStatusLabel(disposition.status)}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
            <p><span className="font-medium">Waktu Disposisi:</span> {formatTime(disposition.disposition_time)}</p>
            <p><span className="font-medium">Diotorisasi oleh:</span> {disposition.authorized_by_staff?.staff_name || '-'}</p>
          </div>
          {disposition.discharge_summary && (
            <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
              <p className="font-medium text-sm">Ringkasan:</p>
              <p className="text-sm">{disposition.discharge_summary}</p>
            </div>
          )}
          {disposition.follow_up_instructions && (
            <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
              <p className="font-medium text-sm">Instruksi Tindak Lanjut:</p>
              <p className="text-sm">{disposition.follow_up_instructions}</p>
            </div>
          )}
        </div>
      )}

      {/* Form Disposisi */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {disposition ? 'Edit Disposisi' : 'Tentukan Disposisi Pasien'}
        </h4>
        
        <div className="space-y-5">
          {/* Pilihan Status Disposisi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Disposisi <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    form.status === option.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={form.status === option.value}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{option.label}</span>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Ringkasan Disposisi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ringkasan / Resume Disposisi
            </label>
            <textarea
              name="discharge_summary"
              value={form.discharge_summary}
              onChange={handleChange}
              rows={3}
              placeholder="Tuliskan ringkasan kondisi pasien saat disposisi..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Contoh: "Pasien membaik, tanda vital stabil, tidak ada keluhan"
            </p>
          </div>

          {/* Instruksi Tindak Lanjut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instruksi Tindak Lanjut
            </label>
            <textarea
              name="follow_up_instructions"
              value={form.follow_up_instructions}
              onChange={handleChange}
              rows={2}
              placeholder="Instruksi untuk pasien setelah disposisi..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Contoh: "Kontrol ke poli umum dalam 3 hari, istirahat cukup, minum obat teratur"
            </p>
          </div>

          {/* Dokter Pengotorisasi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dokter Pengotorisasi <span className="text-red-500">*</span>
            </label>
            <select
              name="authorized_by"
              value={form.authorized_by}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
            >
              <option value="">-- Pilih Dokter --</option>
              {medicStaffList.map(staff => (
                <option key={staff.staff_id} value={staff.staff_id}>
                  {staff.staff_name} ({staff.specialization || 'Dokter Umum'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setForm({
                status: '',
                discharge_summary: '',
                follow_up_instructions: '',
                authorized_by: ''
              });
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
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
                {disposition ? 'Update Disposisi' : 'Simpan Disposisi'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Informasi Penting */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
        <p className="text-xs text-yellow-700">
          <strong className="font-semibold">⚠️ Catatan Penting:</strong><br />
          • Setelah disposisi disimpan, status pasien akan berubah sesuai pilihan dan tidak dapat kembali ke status aktif.<br />
          • Pastikan semua tindakan dan diagnosis sudah dicatat sebelum menyimpan disposisi.<br />
          • Pasien yang dirujuk ke Rawat Inap akan muncul di halaman Pelayanan Rawat Inap.
        </p>
      </div>
    </div>
  );
};

export default DispositionSection;