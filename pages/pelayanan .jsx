import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuPintasan from '../components/MenuPintasan';

const Pelayanan = () => {
  const navigate = useNavigate();
  const [activePatient, setActivePatient] = useState(null);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [admisis, setAdmisis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const PER_PAGE = 10;
  const API_URL = 'http://localhost:5000';
  const token = localStorage.getItem('token');

  // Ambil data admisi dari backend
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAdmisi();
  }, []);

  const fetchAdmisi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admisi`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setAdmisis(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal mengambil data pelayanan');
    } finally {
      setIsLoading(false);
    }
  };

  // Hitung usia dari tanggal lahir
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} Thn`;
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format gender
  const formatGender = (gender) => {
    if (gender === 'male') return 'Laki-laki';
    if (gender === 'female') return 'Perempuan';
    return gender || '-';
  };

  // Filter data
  const filtered = admisis.filter(p => {
    const matchStatus = filterStatus === 'semua' || p.status === filterStatus;
    const matchSearch =
      (p.pasien?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.no_registrasi || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.no_rm || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.pasien?.nik || '').includes(search);
    return matchStatus && matchSearch;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Klik kiri → menu pelayanan dengan data lengkap
  const handleLeftClick = (admisi) => {
    // Siapkan data pasien lengkap untuk dikirim ke MenuPintasan dan AsesmenMedis
    const patientData = {
      id: admisi.id,
      patient_id: admisi.patient_id,
      nama: admisi.pasien?.name || '-',
      noRM: admisi.no_rm || '-',
      noRegistrasi: admisi.no_registrasi || '-',
      dpjp: admisi.dpjp || '-',
      jenisPasien: admisi.jenis_pasien || 'Umum',
      ruangan: admisi.nama_kamar || '-',
      kamar: admisi.nama_kamar || '-',
      tempatTidur: admisi.tempat_tidur || '-',
      umur: admisi.pasien?.birth_date ? calculateAge(admisi.pasien.birth_date) : '-',
      dikirimOleh: admisi.dikirim_oleh || '-',
      tanggalMasuk: admisi.tanggal_masuk ? formatDate(admisi.tanggal_masuk) : '-',
      tanggalKeluar: admisi.tanggal_keluar ? formatDate(admisi.tanggal_keluar) : '-',
      status: admisi.status || 'dirawat',
      spesialisasi: admisi.spesialisasi || '-',
      // Data lengkap pasien dari relasi
      pasien: {
        id: admisi.pasien?.id,
        name: admisi.pasien?.name,
        nik: admisi.pasien?.nik,
        bpjs_number: admisi.pasien?.bpjs_number,
        phone: admisi.pasien?.phone,
        email: admisi.pasien?.email,
        gender: admisi.pasien?.gender,
        birth_date: admisi.pasien?.birth_date,
        address_line: admisi.pasien?.address_line
      }
    };
    
    setActivePatient(patientData);
  };

  // Klik kanan → navigasi ke detail rawat inap
  const handleRightClick = (e, admisi) => {
    e.preventDefault();
    const patientData = {
      id: admisi.id,
      nama: admisi.pasien?.name || '-',
      noRM: admisi.no_rm || '-',
      noRegistrasi: admisi.no_registrasi || '-',
      dpjp: admisi.dpjp || '-',
      kamar: admisi.nama_kamar || '-',
      status: admisi.status || 'dirawat',
      pasien: admisi.pasien
    };
    navigate(`/detail/${admisi.id}`, { state: { patient: patientData } });
  };

  // Hitung statistik
  const totalDirawat = admisis.filter(p => p.status === 'aktif' || p.status === 'dirawat').length;
  const totalPulang = admisis.filter(p => p.status === 'pulang').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Pelayanan Rawat Inap</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Klik untuk membuka menu pelayanan &nbsp;·&nbsp;
            <span className="text-teal-600 font-medium">Klik kanan</span> untuk membuka detail rawat inap
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Total Pasien</p>
            <p className="text-2xl font-bold text-gray-900">{admisis.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Sedang Dirawat</p>
            <p className="text-2xl font-bold text-teal-600">{totalDirawat}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Sudah Pulang</p>
            <p className="text-2xl font-bold text-gray-400">{totalPulang}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama, No. Registrasi, No. RM, atau NIK..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-2">
            {[['semua', 'Semua'], ['dirawat', 'Dirawat'], ['pulang', 'Pulang']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setFilterStatus(val); setPage(1); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filterStatus === val
                    ? val === 'dirawat' ? 'bg-teal-600 text-white'
                      : val === 'pulang' ? 'bg-gray-500 text-white'
                      : 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <svg className="animate-spin h-8 w-8 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500">Memuat data pelayanan...</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #0f766e, #0d9488)' }}>
                    {['NO. REGISTRASI', 'PASIEN', 'JENIS PASIEN', 'DPJP', 'KAMAR', 'MASUK', 'KELUAR', 'STATUS'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((admisi) => (
                    <tr
                      key={admisi.id}
                      onClick={() => handleLeftClick(admisi)}
                      onContextMenu={e => handleRightClick(e, admisi)}
                      title="Klik kiri: menu pelayanan | Klik kanan: detail rawat inap"
                      className={`cursor-pointer transition-colors group select-none ${
                        activePatient?.id === admisi.id
                          ? 'bg-teal-50 border-l-4 border-teal-500'
                          : 'hover:bg-teal-50/40 border-l-4 border-transparent'
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-teal-600 font-semibold group-hover:underline">
                          {admisi.no_registrasi || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-teal-600 font-medium group-hover:underline">
                          {admisi.pasien?.name || '-'}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          RM: {admisi.no_rm || '-'} | NIK: {admisi.pasien?.nik?.slice(-6) || '-'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatGender(admisi.pasien?.gender)} · {admisi.pasien?.phone || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {admisi.jenis_pasien === 'BPJS' || admisi.jenis_pasien === 'jaminan' ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-600">BPJS/Jaminan</span>
                            {admisi.pasien_bpjs && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-500 text-white">
                                {admisi.pasien_bpjs === 'sesuai' ? 'Sesuai Hak' : admisi.pasien_bpjs}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-700">Umum</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-800">{admisi.dpjp || '-'}</p>
                        <p className="text-xs text-teal-500">— {admisi.spesialisasi || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 max-w-[180px]">
                          {admisi.nama_kamar || '-'} {admisi.tempat_tidur ? `- ${admisi.tempat_tidur}` : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                        {formatDate(admisi.tanggal_masuk)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {admisi.tanggal_keluar ? formatDate(admisi.tanggal_keluar) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {admisi.status === 'aktif' || admisi.status === 'dirawat' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            Dirawat
                          </span>
                        ) : admisi.status === 'pulang' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Pulang
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                            {admisi.status || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && !isLoading && (
              <div className="py-12 text-center text-sm text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p>Tidak ada data pasien ditemukan.</p>
                <button
                  onClick={() => navigate('/admisi')}
                  className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                >
                  + Admisi Pasien Baru
                </button>
              </div>
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>
                  Menampilkan {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1} sampai {Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} entri
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
            )}
          </div>
        )}
      </div>

      {/* Menu Pintasan */}
      {activePatient && (
        <MenuPintasan
          patient={activePatient}
          onClose={() => setActivePatient(null)}
        />
      )}
    </div>
  );
};

export default Pelayanan;