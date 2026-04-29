import React from 'react';

const CPPT = ({ patient, data, onDataChange }) => {
  // Data diterima dari parent, bukan state internal
  const formData = data || {
    subjective: '',
    objective: {
      ku: 'Baik',
      gcs: '15',
      gcsLabel: 'Compos Mentis',
      nadi: '',
      tdSistolik: '',
      tdDiastolik: '',
      suhu: '',
      rr: '',
      spo2: '',
      tb: '',
      bb: ''
    },
    assessment: '',
    planning: '',
    instruksiPPA: '',
    tanggal: new Date().toISOString().slice(0, 16),
    dibuatOleh: localStorage.getItem('userName') || 'MEDION'
  };

  // Fungsi update yang memanggil onDataChange dari parent
  const updateForm = (field, value) => {
    if (onDataChange) {
      if (field === 'objective') {
        onDataChange({
          ...formData,
          objective: { ...formData.objective, ...value }
        });
      } else {
        onDataChange({
          ...formData,
          [field]: value
        });
      }
    }
  };

  // Hitung GCS total dan label
  const updateGCS = (e, v, m) => {
    const total = (parseInt(e) || 0) + (parseInt(v) || 0) + (parseInt(m) || 0);
    let label = 'Compos Mentis';
    if (total >= 14) label = 'Compos Mentis';
    else if (total >= 9) label = 'Somnolen';
    else if (total >= 6) label = 'Stupor';
    else label = 'Koma';
    
    updateForm('objective', {
      gcs: total.toString(),
      gcsLabel: label
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* SOAP Form */}
      <div className="space-y-5">
        {/* Subjective */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-blue-50 px-4 py-2 border-b">
            <h3 className="text-sm font-bold text-blue-800">Subjective (Keluhan Pasien)</h3>
          </div>
          <div className="p-4">
            <textarea
              rows={4}
              value={formData.subjective}
              onChange={(e) => updateForm('subjective', e.target.value)}
              placeholder="ps sakit perut, mual dan muntah&#10;Riw. Hipertensi"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Objective */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-green-50 px-4 py-2 border-b">
            <h3 className="text-sm font-bold text-green-800">Objective (Pemeriksaan Fisik & TTV)</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Keadaan Umum */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Keadaan Umum</label>
                <select
                  value={formData.objective.ku}
                  onChange={(e) => updateForm('objective', { ku: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Baik">Baik</option>
                  <option value="Sakit Ringan">Sakit Ringan</option>
                  <option value="Sakit Sedang">Sakit Sedang</option>
                  <option value="Sakit Berat">Sakit Berat</option>
                </select>
              </div>

              {/* GCS */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">GCS</label>
                <div className="flex gap-1">
                  <select
                    value={formData.objective.gcs.split('')[0] || '4'}
                    onChange={(e) => updateGCS(e.target.value, formData.objective.gcs.split('')[1] || '5', formData.objective.gcs.split('')[2] || '6')}
                    className="w-12 px-1 py-2 text-sm border rounded"
                  >
                    {[4,3,2,1].map(v => <option key={v}>{v}</option>)}
                  </select>
                  <span className="text-gray-500">/</span>
                  <select
                    value={formData.objective.gcs.split('')[1] || '5'}
                    onChange={(e) => updateGCS(formData.objective.gcs.split('')[0] || '4', e.target.value, formData.objective.gcs.split('')[2] || '6')}
                    className="w-12 px-1 py-2 text-sm border rounded"
                  >
                    {[5,4,3,2,1].map(v => <option key={v}>{v}</option>)}
                  </select>
                  <span className="text-gray-500">/</span>
                  <select
                    value={formData.objective.gcs.split('')[2] || '6'}
                    onChange={(e) => updateGCS(formData.objective.gcs.split('')[0] || '4', formData.objective.gcs.split('')[1] || '5', e.target.value)}
                    className="w-12 px-1 py-2 text-sm border rounded"
                  >
                    {[6,5,4,3,2,1].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">{formData.objective.gcsLabel}</p>
              </div>

              {/* Nadi */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nadi</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    value={formData.objective.nadi}
                    onChange={(e) => updateForm('objective', { nadi: e.target.value })}
                    placeholder="75"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                  <span className="px-2 py-2 bg-gray-50 border-l text-xs text-gray-500">bpm</span>
                </div>
              </div>

              {/* Tekanan Darah */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tekanan Darah</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={formData.objective.tdSistolik}
                    onChange={(e) => updateForm('objective', { tdSistolik: e.target.value })}
                    placeholder="120"
                    className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-500">/</span>
                  <input
                    type="number"
                    value={formData.objective.tdDiastolik}
                    onChange={(e) => updateForm('objective', { tdDiastolik: e.target.value })}
                    placeholder="80"
                    className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <span className="text-xs text-gray-500">mmHg</span>
                </div>
              </div>

              {/* Suhu */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Suhu</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.objective.suhu}
                    onChange={(e) => updateForm('objective', { suhu: e.target.value })}
                    placeholder="36.5"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                  <span className="px-2 py-2 bg-gray-50 border-l text-xs text-gray-500">°C</span>
                </div>
              </div>

              {/* Respiratory Rate */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Respiratory Rate</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    value={formData.objective.rr}
                    onChange={(e) => updateForm('objective', { rr: e.target.value })}
                    placeholder="18"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                  <span className="px-2 py-2 bg-gray-50 border-l text-xs text-gray-500">x/menit</span>
                </div>
              </div>

              {/* SpO2 */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">SpO2</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    value={formData.objective.spo2}
                    onChange={(e) => updateForm('objective', { spo2: e.target.value })}
                    placeholder="98"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                  <span className="px-2 py-2 bg-gray-50 border-l text-xs text-gray-500">%</span>
                </div>
              </div>

              {/* Tinggi Badan */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tinggi Badan</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.objective.tb}
                    onChange={(e) => updateForm('objective', { tb: e.target.value })}
                    placeholder="165"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                  <span className="px-2 py-2 bg-gray-50 border-l text-xs text-gray-500">cm</span>
                </div>
              </div>

              {/* Berat Badan */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Berat Badan</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.objective.bb}
                    onChange={(e) => updateForm('objective', { bb: e.target.value })}
                    placeholder="70"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                  <span className="px-2 py-2 bg-gray-50 border-l text-xs text-gray-500">kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-yellow-50 px-4 py-2 border-b">
            <h3 className="text-sm font-bold text-yellow-800">Assessment (Analisis / Diagnosa)</h3>
          </div>
          <div className="p-4">
            <textarea
              rows={4}
              value={formData.assessment}
              onChange={(e) => updateForm('assessment', e.target.value)}
              placeholder="Nyeri abdomen, hipertensi tidak terkontrol"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Planning */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-purple-50 px-4 py-2 border-b">
            <h3 className="text-sm font-bold text-purple-800">Planning (Rencana Tindakan)</h3>
          </div>
          <div className="p-4">
            <textarea
              rows={4}
              value={formData.planning}
              onChange={(e) => updateForm('planning', e.target.value)}
              placeholder="Infus RL 20 tpm, observasi TTV tiap 4 jam"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Instruksi PPA */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-orange-50 px-4 py-2 border-b">
            <h3 className="text-sm font-bold text-orange-800">Instruksi PPA</h3>
          </div>
          <div className="p-4">
            <textarea
              rows={3}
              value={formData.instruksiPPA}
              onChange={(e) => updateForm('instruksiPPA', e.target.value)}
              placeholder="Konsul dr. SpPD"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Tanggal & Jam */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="text-sm font-bold text-gray-700">Tanggal & Jam</h3>
          </div>
          <div className="p-4">
            <input
              type="datetime-local"
              value={formData.tanggal}
              onChange={(e) => updateForm('tanggal', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Dibuat & Ditanda Tangani oleh */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="text-sm font-bold text-gray-700">Dibuat & Ditanda Tangani oleh</h3>
          </div>
          <div className="p-4">
            <input
              type="text"
              value={formData.dibuatOleh}
              onChange={(e) => updateForm('dibuatOleh', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Catatan: Tombol simpan di parent (AsesMenKeperawatan), bukan di sini */}
      </div>
    </div>
  );
};

export default CPPT;