// components/IGDFilters.jsx
import React from 'react';

const filterOptions = [
  { value: 'semua', label: 'Semua' },
  { value: 'TRIAGE', label: 'Triage' },
  { value: 'ONGOING', label: 'Sedang Ditangani' },
  { value: 'ADMITTED', label: 'Dirujuk Rawat Inap' },
  { value: 'DISCHARGED', label: 'Selesai' }
];

const IGDFilters = ({ search, setSearch, filterStatus, setFilterStatus, onNewPatient }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Cari nama pasien, NIK, atau keluhan..."
          value={search}
          onChange={e => { setSearch(e.target.value); }}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterStatus(opt.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === opt.value
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        onClick={onNewPatient}
        className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        + Pasien Baru
      </button>
    </div>
  );
};

export default IGDFilters;