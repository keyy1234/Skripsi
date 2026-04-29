import React, { useState, forwardRef, useImperativeHandle } from 'react';

// Data langsung didefinisikan di dalam komponen
const STATUS_PSIKOLOGIS = [
  { code: '17326005', label: 'Tidak ada kelainan (Well in self)' },
  { code: '48694002', label: 'Cemas (Feeling anxious)' },
  { code: '1402001', label: 'Takut (Afraid)' },
  { code: '75408008', label: 'Marah (Feeling angry)' },
  { code: '420038007', label: 'Sedih (Feeling unhappy)' },
  { code: '74964007', label: 'Lain-lain (Other)' },
];

const TINGKAT_KESADARAN = [
  { code: '248234008', label: 'Sadar Baik/Alert (Mentally alert)' },
  { code: '300202002', label: 'Berespon dengan kata-kata/Voice' },
  { code: '450847001', label: 'Hanya berespons jika dirangsang nyeri/Pain' },
  { code: '422768004', label: 'Tidak sadar/Unresponsive' },
  { code: '130987000', label: 'Gelisah atau bingung/Acute confusion' },
  { code: '2776000', label: 'Delirium' },
];

const PemeriksaanFungsional = forwardRef((props, ref) => {
  const [statusPsikologis, setStatusPsikologis] = useState('');
  const [statusPsikologisLainnya, setStatusPsikologisLainnya] = useState('');
  const [tingkatKesadaran, setTingkatKesadaran] = useState('');
  const [skorADL, setSkorADL] = useState('');
  const [skorGCS_E, setSkorGCS_E] = useState('');
  const [skorGCS_V, setSkorGCS_V] = useState('');
  const [skorGCS_M, setSkorGCS_M] = useState('');
  const [skalaNyeri, setSkalaNyeri] = useState('');
  const [lokasiNyeri, setLokasiNyeri] = useState('');
  const [durasiNyeri, setDurasiNyeri] = useState('');

  const totalGCS = (parseInt(skorGCS_E) || 0) + (parseInt(skorGCS_V) || 0) + (parseInt(skorGCS_M) || 0);

  useImperativeHandle(ref, () => ({
    getData: () => {
      return {
        status_psikologis: statusPsikologis === '74964007' ? statusPsikologisLainnya : statusPsikologis,
        status_psikologis_code: statusPsikologis,
        tingkat_kesadaran: tingkatKesadaran,
        skor_adl: skorADL ? parseInt(skorADL) : null,
        gcs: {
          e: skorGCS_E ? parseInt(skorGCS_E) : null,
          v: skorGCS_V ? parseInt(skorGCS_V) : null,
          m: skorGCS_M ? parseInt(skorGCS_M) : null,
          total: totalGCS || null,
        },
        skala_nyeri: skalaNyeri ? parseInt(skalaNyeri) : null,
        lokasi_nyeri: lokasiNyeri,
        durasi_nyeri: durasiNyeri,
      };
    }
  }));

  return (
    <div className="space-y-5">
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">Pemeriksaan Fungsional</h3>
        <p className="text-xs text-gray-500 mt-1">
          Berdasarkan Pedoman SATUSEHAT - Bab 5 (Resource Observation)
        </p>
      </div>

      {/* Status Psikologis */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Status Psikologis <span className="text-red-500">*</span>
          <span className="text-xs text-gray-400 ml-2 font-normal">(LOINC: 8693-4)</span>
        </p>
        <select
          value={statusPsikologis}
          onChange={(e) => {
            setStatusPsikologis(e.target.value);
            if (e.target.value !== '74964007') {
              setStatusPsikologisLainnya('');
            }
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="">-- Pilih Status Psikologis --</option>
          {STATUS_PSIKOLOGIS.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
        {statusPsikologis === '74964007' && (
          <input
            type="text"
            className="w-full mt-3 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Jelaskan status psikologis lainnya..."
            value={statusPsikologisLainnya}
            onChange={(e) => setStatusPsikologisLainnya(e.target.value)}
          />
        )}
      </div>

      {/* Tingkat Kesadaran */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">Tingkat Kesadaran</p>
        <select
          value={tingkatKesadaran}
          onChange={(e) => setTingkatKesadaran(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="">-- Pilih Tingkat Kesadaran --</option>
          {TINGKAT_KESADARAN.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* GCS */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Glasgow Coma Scale (GCS)
          <span className="text-xs text-gray-400 ml-2 font-normal">(Total: {totalGCS})</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Eye (E)</label>
            <select
              value={skorGCS_E}
              onChange={(e) => setSkorGCS_E(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Pilih</option>
              <option value="4">4 - Spontaneous</option>
              <option value="3">3 - To speech</option>
              <option value="2">2 - To pain</option>
              <option value="1">1 - None</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Verbal (V)</label>
            <select
              value={skorGCS_V}
              onChange={(e) => setSkorGCS_V(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Pilih</option>
              <option value="5">5 - Oriented</option>
              <option value="4">4 - Confused</option>
              <option value="3">3 - Inappropriate words</option>
              <option value="2">2 - Incomprehensible sounds</option>
              <option value="1">1 - None</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Motor (M)</label>
            <select
              value={skorGCS_M}
              onChange={(e) => setSkorGCS_M(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Pilih</option>
              <option value="6">6 - Obeys commands</option>
              <option value="5">5 - Localizes pain</option>
              <option value="4">4 - Withdraws from pain</option>
              <option value="3">3 - Abnormal flexion</option>
              <option value="2">2 - Abnormal extension</option>
              <option value="1">1 - None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skor ADL */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Skor ADL (Activities of Daily Living)
          <span className="text-xs text-gray-400 ml-2 font-normal">(SNOMED CT: 715823002) - Range 0-100</span>
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            value={skorADL}
            onChange={(e) => setSkorADL(e.target.value)}
          />
          <input
            type="number"
            className="w-20 px-3 py-2 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={skorADL}
            onChange={(e) => {
              let val = parseInt(e.target.value);
              if (val < 0) val = 0;
              if (val > 100) val = 100;
              setSkorADL(val || 0);
            }}
          />
          <span className="text-sm text-gray-500">/ 100</span>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>0 (Ketergantungan total)</span>
          <span>50 (Ketergantungan sedang)</span>
          <span>100 (Mandiri penuh)</span>
        </div>
      </div>

      {/* Skala Nyeri */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">Skala Nyeri</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            value={skalaNyeri}
            onChange={(e) => setSkalaNyeri(e.target.value)}
          />
          <input
            type="number"
            className="w-16 px-3 py-2 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={skalaNyeri}
            onChange={(e) => {
              let val = parseInt(e.target.value);
              if (val < 0) val = 0;
              if (val > 10) val = 10;
              setSkalaNyeri(val || 0);
            }}
          />
          <span className="text-sm text-gray-500">/ 10</span>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>0 (Tidak nyeri)</span>
          <span>3 (Nyeri ringan)</span>
          <span>6 (Nyeri sedang)</span>
          <span>10 (Nyeri berat)</span>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Lokasi Nyeri</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Contoh: Kepala, Dada, Perut, Ekstremitas..."
            value={lokasiNyeri}
            onChange={(e) => setLokasiNyeri(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Durasi Nyeri</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Contoh: 3 hari, 1 minggu, sejak 2 jam lalu..."
            value={durasiNyeri}
            onChange={(e) => setDurasiNyeri(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
        <p className="text-xs text-teal-700">
          <strong className="font-semibold">📋 Pedoman SATUSEHAT Rawat Inap - Bab 5:</strong> Pemeriksaan Fungsional mencakup 
          Status Psikologis (kode LOINC 8693-4) dan Skor ADL (kode SNOMED CT 715823002).
        </p>
      </div>
    </div>
  );
});

export default PemeriksaanFungsional;