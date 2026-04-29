// components/IGDStats.jsx
import React from 'react';

const IGDStats = ({ totalPasien, totalOngoing, totalAdmitted, totalDischarged }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-5">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs text-gray-500 mb-1">Total Pasien</p>
        <p className="text-2xl font-bold text-gray-900">{totalPasien}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs text-gray-500 mb-1">Sedang Ditangani</p>
        <p className="text-2xl font-bold text-teal-600">{totalOngoing}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs text-gray-500 mb-1">Dirujuk Rawat Inap</p>
        <p className="text-2xl font-bold text-blue-600">{totalAdmitted}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs text-gray-500 mb-1">Selesai / Pulang</p>
        <p className="text-2xl font-bold text-gray-400">{totalDischarged}</p>
      </div>
    </div>
  );
};

export default IGDStats;