// IGD.jsx - Main page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIGDData } from './hooks/useIGDData';
import IGDStats from './components/IGDStats';
import IGDFilters from './components/IGDFilters';
import IGDTable from './components/IGDTable';
import IGDMenuModal from './components/IGDMenuModal';

const IGD = () => {
  const navigate = useNavigate();
  const { encounters, isLoading, error } = useIGDData();
  
  const [filterStatus, setFilterStatus] = useState('semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeEncounter, setActiveEncounter] = useState(null);

  const PER_PAGE = 10;

  // Filter data
  const filtered = encounters.filter(enc => {
    const matchStatus = filterStatus === 'semua' || enc.status === filterStatus;
    const matchSearch =
      (enc.patients?.patient_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (enc.patients?.nik || '').includes(search) ||
      (enc.chief_complaint || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Hitung statistik
  const totalPasien = encounters.length;
  const totalOngoing = encounters.filter(e => e.status === 'ONGOING' || e.status === 'TRIAGE').length;
  const totalDischarged = encounters.filter(e => e.status === 'DISCHARGED').length;
  const totalAdmitted = encounters.filter(e => e.status === 'ADMITTED').length;

  // Handlers
// IGD.jsx - Ganti handleRowClick
const handleRowClick = (encounter) => {
  // Navigasi ke halaman detail_igd dengan membawa data encounter
  navigate(`/igd/detail/${encounter.encounter_id}`, { 
    state: { encounter: encounter } 
  });
};

  const handleRowContextMenu = (e, encounter) => {
    e.preventDefault();
    navigate(`/igd/pasien-aktif/${encounter.encounter_id}`, { state: { encounter } });
  };

  const handleNewPatient = () => {
    navigate('/igd/triage');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg className="animate-spin h-8 w-8 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500">Memuat data IGD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">IGD - Gawat Darurat</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Klik untuk membuka menu pelayanan IGD &nbsp;·&nbsp;
            <span className="text-teal-600 font-medium">Klik kanan</span> untuk membuka detail pasien
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats */}
        <IGDStats 
          totalPasien={totalPasien}
          totalOngoing={totalOngoing}
          totalAdmitted={totalAdmitted}
          totalDischarged={totalDischarged}
        />

        {/* Filters */}
        <IGDFilters
          search={search}
          setSearch={(val) => { setSearch(val); setPage(1); }}
          filterStatus={filterStatus}
          setFilterStatus={(val) => { setFilterStatus(val); setPage(1); }}
          onNewPatient={handleNewPatient}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {paginated.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>Tidak ada data pasien ditemukan.</p>
              <button
                onClick={handleNewPatient}
                className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
              >
                + Pasien Baru
              </button>
            </div>
          ) : (
            <>
              <IGDTable 
                encounters={paginated}
                activeEncounterId={activeEncounter?.encounter_id}
                onRowClick={handleRowClick}
                onRowContextMenu={handleRowContextMenu}
              />
              
              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>
                  Menampilkan {(page - 1) * PER_PAGE + 1} sampai {Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} entri
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition text-xs"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={page * PER_PAGE >= filtered.length}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition text-xs"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Menu Pintasan */}
      {activeEncounter && (
        <IGDMenuModal 
          encounter={activeEncounter}
          onClose={() => setActiveEncounter(null)}
        />
      )}
    </div>
  );
};

export default IGD;