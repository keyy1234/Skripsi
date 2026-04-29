import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

// Options tetap (tidak berubah)
const PENJAMIN_OPTIONS = ['BPJS Kesehatan', 'Asuransi Swasta', 'Perusahaan', 'Mandiri', 'Jamkesda'];
const SPESIALISASI_OPTIONS = ['-- Silakan Pilih Spesialisasi --', 'Penyakit Dalam', 'Bedah', 'Anak', 'Kandungan', 'Saraf', 'Jantung', 'Ortopedi'];
const DPJP_OPTIONS = ['-- Silakan Pilih DPJP --', 'Dokter Umum 1', 'Dokter Umum 2', 'Dokter Spesialis 1', 'Dokter Spesialis 2', 'Dokter Umum 38'];
const KAMAR_OPTIONS = ['-- Silakan Pilih --', 'Kamar Mawar 1', 'Kamar Mawar 2', 'Kamar Melati 1', 'ICU A', 'VVIP 1'];
const DIKIRIM_OPTIONS = ['Puskesmas', 'Rumah Sakit Lain', 'Klinik', 'Praktek Dokter', 'Datang Sendiri'];
const DITERIMA_OPTIONS = ['Rawat Jalan', 'IGD', 'Poliklinik', 'Rujukan'];

// Komponen Search Dropdown dengan data dari database
const PatientSearchDropdown = ({ onSelect, patients, isLoading }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('Pasien Rawat Jalan/Darurat');
  const ref = useRef(null);

  const filteredPatients = query.length >= 2 && patients.length > 0
    ? patients.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.nik?.includes(query) ||
        p.bpjs_number?.includes(query)
      )
    : [];

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-0 rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm">
        <div className="relative">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="h-10 pl-3 pr-8 text-sm text-gray-700 bg-gray-50 border-r border-gray-300 appearance-none focus:outline-none cursor-pointer font-medium"
          >
            <option>Pasien Rawat Jalan/Darurat</option>
            <option>Semua Pasien</option>
            <option>Pasien Kontrol</option>
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex-1 flex items-center px-3 gap-2">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Cari Pasien (nama, NIK, No. BPJS)..."
            className="flex-1 h-10 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
          />
          {query && (
            <button onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button className="px-3 border-l border-gray-300 text-gray-500 hover:bg-gray-50" onClick={() => setOpen(v => !v)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-300 rounded-lg shadow-xl z-50 px-4 py-6 text-center">
          <svg className="animate-spin h-5 w-5 text-teal-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-gray-500">Memuat data pasien...</p>
        </div>
      )}

      {/* Results */}
      {open && !isLoading && filteredPatients.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
          {filteredPatients.map((p, i) => (
            <button
              key={p.id || i}
              className="w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-teal-600 hover:text-white group transition-colors"
              onClick={() => { onSelect(p); setOpen(false); setQuery(`[${p.nik?.slice(-6) || 'No RM'}] ${p.name}`); }}
            >
              <p className="font-semibold text-sm group-hover:text-white text-gray-900">
                [{p.nik?.slice(-6) || 'No NIK'}] {p.name}
              </p>
              <p className="text-xs mt-0.5 group-hover:text-teal-100 text-gray-500">
                NIK: {p.nik || '-'} | BPJS: {p.bpjs_number || '-'}
              </p>
              <p className="text-xs group-hover:text-teal-100 text-gray-500">
                Alamat: {p.address_line || '-'}
              </p>
              <p className="text-xs group-hover:text-teal-100 text-gray-500">
                No. Telepon: {p.phone || '-'}
              </p>
            </button>
          ))}
        </div>
      )}

      {open && !isLoading && query.length >= 2 && filteredPatients.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-300 rounded-lg shadow-xl z-50 px-4 py-6 text-center text-sm text-gray-500">
          Pasien tidak ditemukan
        </div>
      )}
    </div>
  );
};

// Komponen Form Field
const FormField = ({ label, required, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ placeholder, value, onChange, type = 'text', className = '' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 bg-white ${className}`}
  />
);

const Select = ({ options, value, onChange }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-700"
  >
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

const RadioGroup = ({ name, options, value, onChange }) => (
  <div className="flex gap-5">
    {options.map(opt => (
      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="w-4 h-4 accent-teal-600"
        />
        <span className="text-sm text-gray-700">{opt.label}</span>
      </label>
    ))}
  </div>
);

// ====== Main Component ======
const AdmisiRawatInap = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('registrasi');
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [jenisPasien, setJenisPasien] = useState('umum');
  const [pasienBPJS, setPasienBPJS] = useState('');
  const [penjamin1, setPenjamin1] = useState('-- Silakan Pilih --');
  const [penjamin2, setPenjamin2] = useState('-- Silakan Pilih --');
  const [noPeserta1, setNoPeserta1] = useState('');
  const [noPeserta2, setNoPeserta2] = useState('');
  const [noSEP, setNoSEP] = useState('');
  const [dikirimOleh, setDikirimOleh] = useState('Puskesmas');
  const [dokterPenerima, setDokterPenerima] = useState('Dokter Umum 38');
  const [diterimaMelalui, setDiterimaMelalui] = useState('Rawat Jalan');
  const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().slice(0, 16));
  const [spesialisasi, setSpesialisasi] = useState('-- Silakan Pilih Spesialisasi --');
  const [dpjp, setDpjp] = useState('-- Silakan Pilih DPJP --');
  const [namaKamar, setNamaKamar] = useState('-- Silakan Pilih --');
  const [tempatTidur, setTempatTidur] = useState('-- Silakan Pilih Kamar --');
  const [sameRoom, setSameRoom] = useState(true);

  const token = localStorage.getItem('token');

  // Ambil data pasien dari database
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const response = await fetch(`${API_URL}/api/pasien?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPatients(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Fetch patients error:', err);
      setError('Gagal mengambil data pasien');
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    setError('');
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} Thn`;
  };

  const formatGender = (gender) => {
    if (gender === 'male') return 'Laki-laki';
    if (gender === 'female') return 'Perempuan';
    return gender || '-';
  };

  const handleSave = async () => {
  if (!selectedPatient) {
    setError('Pilih pasien terlebih dahulu');
    return;
  }

  setIsSaving(true);
  setError('');
  setSuccess('');

  const admisiData = {
    patient_id: selectedPatient.id,
    no_rm: selectedPatient.nik?.slice(-8) || 'RM-' + Date.now(),
    jenis_pasien: jenisPasien,
    pasien_bpjs: pasienBPJS,
    penjamin_1: penjamin1,
    penjamin_2: penjamin2,
    no_peserta_1: noPeserta1,
    no_peserta_2: noPeserta2,
    no_sep: noSEP,
    dikirim_oleh: dikirimOleh,
    dokter_penerima: dokterPenerima,
    diterima_melalui: diterimaMelalui,
    tanggal_masuk: tanggalMasuk,
    spesialisasi: spesialisasi,
    dpjp: dpjp,
    nama_kamar: namaKamar,
    tempat_tidur: tempatTidur
  };

  try {
    const response = await fetch(`${API_URL}/api/admisi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(admisiData)
    });

    const result = await response.json();

    if (result.success) {
      setSuccess(`Admisi rawat inap berhasil! No Registrasi: ${result.data.no_registrasi}`);
      setTimeout(() => {
        navigate('/pelayanan');
      }, 2000);
    } else {
      setError(result.message || 'Gagal menyimpan data');
    }
  } catch (err) {
    console.error('Save error:', err);
    setError('Terjadi kesalahan saat menyimpan data');
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6">

        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Admisi Rawat Inap</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registrasi dan penerimaan pasien rawat inap</p>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Search section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Cari Pasien</p>
          <PatientSearchDropdown 
            onSelect={handleSelectPatient} 
            patients={patients} 
            isLoading={isLoadingPatients} 
          />
          {!selectedPatient && !isLoadingPatients && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400 py-3 border border-dashed border-gray-200 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Silakan Cari Pasien Admisi
            </div>
          )}
        </div>

        {/* Patient info card */}
        {selectedPatient && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-5 overflow-hidden">
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)' }} />
            <div className="px-5 py-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedPatient.name}</p>
                    <p className="text-xs text-teal-600 font-medium">{formatGender(selectedPatient.gender)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">NIK</span>
                  <span className="font-semibold text-gray-800">{selectedPatient.nik || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">No. BPJS</span>
                  <span className="font-semibold text-gray-800">{selectedPatient.bpjs_number || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Umur</span>
                  <span className="font-semibold text-gray-800">{calculateAge(selectedPatient.birth_date)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Alamat</span>
                  <span className="font-semibold text-gray-800 truncate block">{selectedPatient.address_line || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">No. Telepon</span>
                  <span className="font-semibold text-gray-800">{selectedPatient.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Email</span>
                  <span className="font-semibold text-gray-800 truncate block">{selectedPatient.email || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Tanggal Lahir</span>
                  <span className="font-semibold text-gray-800">{selectedPatient.birth_date || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status</span>
                  <span className="font-semibold text-gray-800">{selectedPatient.marital_status_display || '-'}</span>
                </div>
              </div>
            </div>

            {/* Tab buttons */}
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setActiveTab('registrasi')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'registrasi'
                    ? 'border-teal-500 text-teal-700 bg-teal-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Registrasi Rawat Inap
              </button>
              <button
                onClick={() => setActiveTab('spri')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'spri'
                    ? 'border-teal-500 text-teal-700 bg-teal-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                SPRI
              </button>
            </div>
          </div>
        )}

        {/* Form Registrasi Rawat Inap */}
        {selectedPatient && activeTab === 'registrasi' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">

            {/* Jenis Pasien */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Jenis Pasien</p>
                <RadioGroup
                  name="jenisPasien"
                  options={[{ value: 'umum', label: 'Pasien Umum' }, { value: 'jaminan', label: 'Pasien Jaminan' }]}
                  value={jenisPasien}
                  onChange={setJenisPasien}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Pasien BPJS</p>
                <RadioGroup
                  name="pasienBPJS"
                  options={[{ value: 'sesuai', label: 'BPJS Sesuai Hak' }, { value: 'selisih', label: 'BPJS Selisih' }]}
                  value={pasienBPJS}
                  onChange={setPasienBPJS}
                />
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Penjamin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Penjamin Pertama">
                <Select
                  options={['-- Silakan Pilih --', ...PENJAMIN_OPTIONS]}
                  value={penjamin1}
                  onChange={e => setPenjamin1(e.target.value)}
                />
              </FormField>
              <FormField label="Penjamin Kedua">
                <Select
                  options={['-- Silakan Pilih --', ...PENJAMIN_OPTIONS]}
                  value={penjamin2}
                  onChange={e => setPenjamin2(e.target.value)}
                />
              </FormField>
              <FormField label="Nomor Peserta (Penjamin Pertama)">
                <Input placeholder="Nomor Peserta" value={noPeserta1} onChange={e => setNoPeserta1(e.target.value)} />
              </FormField>
              <FormField label="Nomor Peserta (Penjamin Kedua)">
                <Input placeholder="Nomor Peserta" value={noPeserta2} onChange={e => setNoPeserta2(e.target.value)} />
              </FormField>
            </div>

            <div className="border-t border-gray-100" />

            {/* SEP BPJS */}
            <FormField label="Nomor SEP (BPJS)">
              <div className="flex gap-2">
                <Input placeholder="Nomor SEP" value={noSEP} onChange={e => setNoSEP(e.target.value)} className="flex-1" />
                <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Cari
                </button>
              </div>
            </FormField>

            <div className="border-t border-gray-100" />

            {/* Pengiriman & Penerimaan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormField label="Dikirim Oleh">
                <Select options={DIKIRIM_OPTIONS} value={dikirimOleh} onChange={e => setDikirimOleh(e.target.value)} />
              </FormField>
              <FormField label="Dokter Penerima Pasien">
                <Select options={['-- Pilih Dokter --', 'Dokter Umum 38', 'Dokter Umum 12', 'Dokter Spesialis 1']} value={dokterPenerima} onChange={e => setDokterPenerima(e.target.value)} />
              </FormField>
              <FormField label="Diterima Melalui">
                <Select options={DITERIMA_OPTIONS} value={diterimaMelalui} onChange={e => setDiterimaMelalui(e.target.value)} />
              </FormField>
            </div>

            <div className="border-t border-gray-100" />

            {/* Tanggal & Spesialisasi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormField label="Tanggal Masuk" required>
                <Input type="datetime-local" value={tanggalMasuk} onChange={e => setTanggalMasuk(e.target.value)} />
              </FormField>
              <FormField label="Spesialisasi">
                <Select options={SPESIALISASI_OPTIONS} value={spesialisasi} onChange={e => setSpesialisasi(e.target.value)} />
              </FormField>
              <FormField label="DPJP">
                <Select options={DPJP_OPTIONS} value={dpjp} onChange={e => setDpjp(e.target.value)} />
              </FormField>
            </div>

            <div className="border-t border-gray-100" />

            {/* Kamar */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Kamar Yang Ditagihkan Ke Pasien</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Nama Kamar">
                      <Select options={KAMAR_OPTIONS} value={namaKamar} onChange={e => setNamaKamar(e.target.value)} />
                    </FormField>
                    <FormField label="Tempat Tidur">
                      <Select options={['-- Silakan Pilih Kamar --', 'TT-01', 'TT-02', 'TT-03']} value={tempatTidur} onChange={e => setTempatTidur(e.target.value)} />
                    </FormField>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">Kamar Yang Ditempati Pasien</p>
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameRoom}
                        onChange={e => setSameRoom(e.target.checked)}
                        className="w-3.5 h-3.5 accent-teal-600"
                      />
                      Sama dengan yang ditagihkan ke pasien
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Nama Kamar">
                      <Select
                        options={sameRoom ? [namaKamar] : KAMAR_OPTIONS}
                        value={sameRoom ? namaKamar : undefined}
                        onChange={() => {}}
                      />
                    </FormField>
                    <FormField label="Tempat Tidur">
                      <Select
                        options={sameRoom ? [tempatTidur] : ['-- Pilih Kamar Terlebih Dahulu --', 'TT-01', 'TT-02']}
                        value={sameRoom ? tempatTidur : undefined}
                        onChange={() => {}}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPatient(null)}
                className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batal
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SPRI tab */}
        {selectedPatient && activeTab === 'spri' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">Form SPRI akan ditampilkan di sini</p>
            <p className="text-gray-400 text-xs mt-1">Surat Pernyataan Rawat Inap</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdmisiRawatInap;