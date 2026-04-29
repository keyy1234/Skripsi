import React, { useState, forwardRef, useImperativeHandle } from 'react';

const RiwayatPerjalanan = forwardRef((props, ref) => {
  const [riwayatPerjalanan, setRiwayatPerjalanan] = useState('');

  useImperativeHandle(ref, () => ({
    getData: () => {
      return {
        riwayat_perjalanan_penyakit: riwayatPerjalanan
      };
    }
  }));

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">Riwayat Perjalanan Penyakit</h3>
        <p className="text-xs text-gray-500 mt-1">
          Berdasarkan Pedoman SATUSEHAT - Bab 6 (Resource ClinicalImpression)
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Deskripsi Perjalanan Penyakit
        </label>
        <textarea
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[200px]"
          placeholder="Deskripsikan perkembangan penyakit pasien selama perawatan..."
          value={riwayatPerjalanan}
          onChange={(e) => setRiwayatPerjalanan(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-2">
          Contoh: Pasien mengalami peningkatan tekanan darah, keluhan pusing berkurang setelah pemberian obat antihipertensi.
        </p>
      </div>
    </div>
  );
});

export default RiwayatPerjalanan;