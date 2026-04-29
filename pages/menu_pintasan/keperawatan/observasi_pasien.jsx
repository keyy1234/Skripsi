import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from "react-qr-code";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import ToastNotification from '../../../components/ToastNotification';
import { useBlockchainNotification } from '../../../context/BlockchainNotificationContext';

const API_URL = 'http://localhost:5000';

// ── Default patient (passed from Pelayanan via route state / props) ───
const DEFAULT_PATIENT = {
  noRM: '-',
  nama: '-',
  noRegistrasi: '-',
  umur: '-',
  jenisPasien: '-',
  ruangan: '-',
  dpjp: '-',
};

// ── Chart toolbar icons ───────────────────────────────────────────────
const ChartToolbar = () => (
  <div className="flex items-center gap-0.5">
    {[
      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4',
    ].map((d, i) => (
      <button key={i} className="p-1 text-gray-400 hover:text-gray-700 transition-colors rounded hover:bg-gray-100">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
        </svg>
      </button>
    ))}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}</span></p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, dataKey, unit, domain, full, data }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 ${full ? 'col-span-2' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <ChartToolbar />
    </div>
    <ResponsiveContainer width="100%" height={full ? 220 : 170}>
      <LineChart data={data || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="waktu" tick={{ fontSize: 10 }} />
        <YAxis domain={domain} tick={{ fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        {Array.isArray(dataKey)
          ? dataKey.map(dk => (
              <Line key={dk.key} type="monotone" dataKey={dk.key} name={dk.name} stroke={dk.color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ))
          : <Line type="monotone" dataKey={dataKey} name={title} stroke={unit === '°C' ? '#f59e0b' : unit === 'x/mnt' && title.includes('Nafas') ? '#8b5cf6' : unit === '%' ? '#0ea5e9' : '#10b981'} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        }
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ── Tab: Grafik TTV ──────────────────────────────────────────────────
const GrafikTTV = ({ ttvChartData }) => (
  <div className="space-y-5">
    <ChartCard 
      title="Tekanan Darah Pasien" 
      dataKey={[{ key: 'sistolik', name: 'Sistolik', color: '#ef4444' }, { key: 'diastolik', name: 'Diastolik', color: '#3b82f6' }]} 
      unit="mmHg" 
      domain={[50, 200]} 
      full 
      data={ttvChartData}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <ChartCard title="Suhu Badan Pasien" dataKey="suhu" unit="°C" domain={[35, 42]} data={ttvChartData} />
      <ChartCard title="Pernafasan Pasien" dataKey="nafas" unit="x/mnt" domain={[10, 50]} data={ttvChartData} />
      <ChartCard title="Nadi Pasien" dataKey="nadi" unit="x/mnt" domain={[50, 150]} data={ttvChartData} />
      <ChartCard title="SpO2 Pasien" dataKey="spo2" unit="%" domain={[90, 100]} data={ttvChartData} />
    </div>
  </div>
);

// ── Tab: Riwayat Observasi ───────────────────────────────────────────
const RiwayatObservasi = ({ observasiList, onDelete, isLoading, formatDate, formatTime }) => {
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(10);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <svg className="animate-spin h-8 w-8 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-gray-500">Memuat data observasi...</p>
      </div>
    );
  }

  if (observasiList.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500">Belum ada data observasi</p>
      </div>
    );
  }

  const filtered = observasiList.filter(r =>
    formatDate(r.tanggal_observasi).toLowerCase().includes(search.toLowerCase()) ||
    (r.perawat_nama || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 w-44"
        />
        <button onClick={() => setSearch('')} className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Tanggal', 'Jam', 'Tensi', 'Nadi', 'Suhu', 'Nafas', 'SpO2', 'Skala Nyeri', 'EWS', 'Perawat', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, perPage).map((row) => (
              <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(row.tanggal_observasi)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.jam_observasi?.substring(0, 5)}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{row.tekanan_darah_sistolik}/{row.tekanan_darah_diastolik}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{row.nadi}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{row.suhu}°C</td>
                <td className="px-4 py-3 text-sm text-gray-800">{row.nafas}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{row.spo2}%</td>
                <td className="px-4 py-3 text-sm text-gray-800">{row.skala_nyeri}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded text-white text-xs font-bold ${
                    row.ews >= 5 ? 'bg-red-500' : row.ews >= 3 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {row.ews}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.perawat_nama || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-center gap-1">
                    <QRCode value={`OBS-${row.id}|${row.tanggal_observasi}|${row.jam_observasi}`} size={50} />
                    <button
                      onClick={() => onDelete(row.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">Total {filtered.length} data</span>
        <select
          value={perPage}
          onChange={e => setPerPage(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded"
        >
          {[10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    </div>
  );
};

// ── Tab: Buat Catatan Observasi ──────────────────────────────────────
const BuatCatatanObservasi = ({ patient, onSave, isSaving }) => {
  const [form, setForm] = useState({
    tanggal_observasi: new Date().toISOString().split('T')[0],
    jam_observasi: new Date().toTimeString().slice(0, 5),
    tekanan_darah_sistolik: '',
    tekanan_darah_diastolik: '',
    nadi: '',
    suhu: '',
    nafas: '',
    spo2: '',
    skala_nyeri: '',
    berat_badan: '',
    tinggi_badan: '',
    perawat_nama: '',
    catatan: ''
  });

  const [error, setError] = useState('');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.tekanan_darah_sistolik && !form.nadi && !form.suhu && !form.nafas && !form.spo2) {
      setError('Minimal satu parameter TTV harus diisi');
      setTimeout(() => setError(''), 3000);
      return;
    }
    onSave(form);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
      
      <h3 className="text-sm font-bold text-gray-800 mb-5">Buat Catatan Observasi</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Tanggal</label>
          <input type="date" value={form.tanggal_observasi} onChange={e => update('tanggal_observasi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Jam</label>
          <input type="time" value={form.jam_observasi} onChange={e => update('jam_observasi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tensi Sistolik (mmHg)</label>
          <input type="number" value={form.tekanan_darah_sistolik} onChange={e => update('tekanan_darah_sistolik', e.target.value)} placeholder="120" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tensi Diastolik (mmHg)</label>
          <input type="number" value={form.tekanan_darah_diastolik} onChange={e => update('tekanan_darah_diastolik', e.target.value)} placeholder="80" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nadi (x/mnt)</label>
          <input type="number" value={form.nadi} onChange={e => update('nadi', e.target.value)} placeholder="75" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Suhu (°C)</label>
          <input type="number" step="0.1" value={form.suhu} onChange={e => update('suhu', e.target.value)} placeholder="36.5" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nafas (x/mnt)</label>
          <input type="number" value={form.nafas} onChange={e => update('nafas', e.target.value)} placeholder="18" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">SpO2 (%)</label>
          <input type="number" value={form.spo2} onChange={e => update('spo2', e.target.value)} placeholder="98" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Skala Nyeri (0-10)</label>
          <input type="number" value={form.skala_nyeri} onChange={e => update('skala_nyeri', e.target.value)} placeholder="0" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Berat Badan (kg)</label>
          <input type="number" step="0.1" value={form.berat_badan} onChange={e => update('berat_badan', e.target.value)} placeholder="0.00" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tinggi Badan (cm)</label>
          <input type="number" step="0.1" value={form.tinggi_badan} onChange={e => update('tinggi_badan', e.target.value)} placeholder="0.00" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Perawat/Bidan</label>
          <input type="text" value={form.perawat_nama} onChange={e => update('perawat_nama', e.target.value)} placeholder="Nama perawat" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Catatan</label>
        <textarea rows={3} value={form.catatan} onChange={e => update('catatan', e.target.value)} placeholder="Catatan tambahan..." className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={handleSubmit} disabled={isSaving} className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow-sm disabled:opacity-50">
          {isSaving ? 'Menyimpan...' : 'Simpan Observasi'}
        </button>
      </div>
    </div>
  );
};

// ── Tab: Detail Observasi ────────────────────────────────────────────
const DetailObservasi = ({ lastObservasi }) => {
  if (!lastObservasi) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-500">Belum ada data observasi</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-sm font-bold text-gray-800 mb-4">Detail Observasi Terakhir</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Tekanan Darah</p>
          <p className="text-2xl font-extrabold text-red-600">{lastObservasi.tekanan_darah_sistolik || '-'}/{lastObservasi.tekanan_darah_diastolik || '-'}</p>
          <p className="text-xs text-gray-400">mmHg</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Nadi</p>
          <p className="text-2xl font-extrabold text-green-600">{lastObservasi.nadi || '-'}</p>
          <p className="text-xs text-gray-400">x/mnt</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Suhu Badan</p>
          <p className="text-2xl font-extrabold text-amber-600">{lastObservasi.suhu || '-'}°C</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Nafas</p>
          <p className="text-2xl font-extrabold text-purple-600">{lastObservasi.nafas || '-'}</p>
          <p className="text-xs text-gray-400">x/mnt</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Skala Nyeri</p>
          <p className="text-2xl font-extrabold text-orange-600">{lastObservasi.skala_nyeri || '-'}</p>
          <p className="text-xs text-gray-400">/10</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Early Warning Score</p>
          <p className="text-2xl font-extrabold text-blue-600">{lastObservasi.ews || 0}</p>
          <p className="text-xs text-gray-400">skor</p>
        </div>
        <div className="bg-teal-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">SpO2</p>
          <p className="text-2xl font-extrabold text-teal-600">{lastObservasi.spo2 || '-'}%</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Perawat</p>
          <p className="text-lg font-extrabold text-indigo-600">{lastObservasi.perawat_nama || '-'}</p>
        </div>
      </div>
    </div>
  );
};

// ── Tabs config ───────────────────────────────────────────────────────
const TABS = [
  { id: 'grafik', label: 'Grafik TTV', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'riwayat', label: 'Riwayat Observasi', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'buat', label: 'Buat Catatan Observasi', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'detail', label: 'Detail Observasi', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
];

// ── Main page ─────────────────────────────────────────────────────────
const ObservasiPasien = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient || null;

  const [activeTab, setActiveTab] = useState('grafik');
  const [observasiList, setObservasiList] = useState([]);
  const [ttvChartData, setTtvChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { showBlockchainNotification, updateBlockchainNotification } = useBlockchainNotification();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (patient?.patient_id || patient?.id) {
      fetchObservasi();
      fetchGrafikTTV();
    }
  }, [patient]);

  const fetchObservasi = async () => {
    setIsLoading(true);
    try {
      const patientId = patient?.patient_id || patient?.pasien?.id || patient?.id;
      const response = await fetch(`${API_URL}/api/observasi?patient_id=${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setObservasiList(result.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal mengambil data observasi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGrafikTTV = async () => {
    try {
      const patientId = patient?.patient_id || patient?.pasien?.id || patient?.id;
      const response = await fetch(`${API_URL}/api/observasi/grafik?patient_id=${patientId}&days=7`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setTtvChartData(result.data);
      }
    } catch (err) {
      console.error('Fetch chart error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus observasi ini?')) return;
    try {
      const response = await fetch(`${API_URL}/api/observasi/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        fetchObservasi();
        fetchGrafikTTV();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    setError('');

    const patientId = patient?.patient_id || patient?.pasien?.id || patient?.id;
    if (!patientId) {
      setError('Data pasien tidak ditemukan');
      setIsSaving(false);
      return;
    }

    showBlockchainNotification('pending', null, 'Menyimpan observasi...');

    try {
      const response = await fetch(`${API_URL}/api/observasi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientId,
          admisi_id: patient?.id,
          no_registrasi: patient?.no_registrasi,
          ...formData
        })
      });

      const result = await response.json();
      if (result.success) {
        updateBlockchainNotification('success', result.data?.blockchain_tx_hash, 'Observasi berhasil disimpan!');
        fetchObservasi();
        fetchGrafikTTV();
        setActiveTab('riwayat');
      } else {
        updateBlockchainNotification('error', null, result.message || 'Gagal menyimpan');
        setError(result.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('Save error:', err);
      updateBlockchainNotification('error', null, 'Terjadi kesalahan');
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  const lastObservasi = observasiList.length > 0 ? observasiList[0] : null;

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tidak Ada Data Pasien</h2>
          <p className="text-gray-500 mb-6">Silakan pilih pasien terlebih dahulu dari halaman Pelayanan.</p>
          <button onClick={() => navigate('/pelayanan')} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
            Kembali ke Pelayanan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6 space-y-5">
        {/* Patient info card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)' }} />
          <div className="px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{patient?.pasien?.name || patient?.nama || '-'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1.5 text-sm">
              <p><span className="text-gray-500">No. Registrasi: </span><span className="font-medium">{patient?.no_registrasi || '-'}</span></p>
              <p><span className="text-gray-500">Jenis Pasien: </span><span className="font-medium">{patient?.jenis_pasien || 'Umum'}</span></p>
              <p><span className="text-gray-500">Ruangan: </span><span className="font-medium">{patient?.nama_kamar || '-'}</span></p>
              <p><span className="text-gray-500">DPJP: </span><span className="font-medium">{patient?.dpjp || '-'}</span></p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-200 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        {activeTab === 'grafik' && <GrafikTTV ttvChartData={ttvChartData} />}
        {activeTab === 'riwayat' && (
          <RiwayatObservasi
            observasiList={observasiList}
            onDelete={handleDelete}
            isLoading={isLoading}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )}
        {activeTab === 'buat' && (
          <BuatCatatanObservasi
            patient={patient}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
        {activeTab === 'detail' && <DetailObservasi lastObservasi={lastObservasi} />}
      </div>
    </div>
  );
};

export default ObservasiPasien;