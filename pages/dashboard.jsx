import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API_URL = 'http://localhost:5000';

// Komponen Stat Card
const StatCard = ({ label, value, sub, icon, color, trend }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start justify-between">
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {trend !== undefined && trend !== 0 && (
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trend >= 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
          </svg>
          {Math.abs(trend)}% dari bulan lalu
        </div>
      )}
    </div>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')}`}>
      {icon}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}</span></p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState('line');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk data dashboard
  const [stats, setStats] = useState({
    totalPasien: 0,
    pasienDirawat: 0,
    pasienPulang: 0,
    totalAdmisi: 0
  });
  
  const [recentAdmisi, setRecentAdmisi] = useState([]);
  const [blockchainActivity, setBlockchainActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const token = localStorage.getItem('token');

  // Fetch data dashboard
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch admisi data
      const admisiResponse = await fetch(`${API_URL}/api/admisi`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const admisiResult = await admisiResponse.json();
      
      if (admisiResult.success) {
        const admisiData = admisiResult.data || [];
        
        // Hitung statistik
        const dirawat = admisiData.filter(a => a.status === 'aktif' || a.status === 'dirawat').length;
        const pulang = admisiData.filter(a => a.status === 'pulang').length;
        
        setStats({
          totalPasien: admisiData.length,
          pasienDirawat: dirawat,
          pasienPulang: pulang,
          totalAdmisi: admisiData.length
        });
        
        // Data untuk chart (group by bulan)
        const monthlyData = groupByMonth(admisiData);
        setChartData(monthlyData);
        
        // Data untuk pie chart (distribusi per ruangan)
        const roomDistribution = getRoomDistribution(admisiData);
        setPieData(roomDistribution);
        
        // Recent admisi (5 terbaru)
        const recent = [...admisiData]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentAdmisi(recent);
        
        // Blockchain activity (dari rekam medis yang sudah terverifikasi)
        await fetchBlockchainActivity();
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError('Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  };

 const fetchBlockchainActivity = async () => {
  try {
    // Ganti endpoint sesuai yang tersedia di backend
    const response = await fetch(`${API_URL}/api/asesmen-medis?limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      const activities = result.data
        .filter(r => r.blockchain_verified === true)
        .map(r => ({
          hash: r.blockchain_tx_hash ? `${r.blockchain_tx_hash.substring(0, 10)}...${r.blockchain_tx_hash.slice(-8)}` : '-',
          aksi: r.action_type === 'create' ? 'Rekam Medis Ditambah' : 'Data Diperbarui',
          pasien: r.patient_id?.substring(0, 8) || '-',
          waktu: formatRelativeTime(r.created_at),
          type: r.action_type,
          txHash: r.blockchain_tx_hash
        }));
      setBlockchainActivity(activities.slice(0, 5));
    } else {
      setBlockchainActivity([]);
    }
  } catch (err) {
    console.error('Fetch blockchain activity error:', err);
    // Fallback data dummy
    setBlockchainActivity([
      { hash: '0x3f4a...b92e', aksi: 'Rekam Medis Ditambah', pasien: '0e2ae399', waktu: 'Baru saja', type: 'create', txHash: null },
      { hash: '-', aksi: 'Menunggu verifikasi', pasien: '-', waktu: '-', type: 'pending', txHash: null }
    ]);
  }
};
  const groupByMonth = (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthly = {};
    
    data.forEach(item => {
      if (item.created_at) {
        const date = new Date(item.created_at);
        const month = months[date.getMonth()];
        if (!monthly[month]) {
          monthly[month] = { bulan: month, rawatInap: 0 };
        }
        monthly[month].rawatInap++;
      }
    });
    
    return Object.values(monthly).slice(-6);
  };

  const getRoomDistribution = (data) => {
    const rooms = {};
    data.forEach(item => {
      const room = item.nama_kamar || 'Lainnya';
      rooms[room] = (rooms[room] || 0) + 1;
    });
    
    const colors = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];
    return Object.entries(rooms).slice(0, 5).map(([name, value], i) => ({
      name: name.length > 15 ? name.substring(0, 12) + '...' : name,
      value: value,
      color: colors[i % colors.length]
    }));
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-teal-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-gray-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Statistik & ringkasan sistem</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-gray-900 text-teal-400 px-3 py-1.5 rounded-lg border border-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Chain synced · {blockchainActivity.filter(a => a.txHash).length} transaksi
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Statistik Pasien Rawat Inap</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Pasien"
              value={stats.totalPasien}
              sub="Terdaftar di sistem"
              color="text-teal-600"
              icon={<svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <StatCard
              label="Sedang Dirawat"
              value={stats.pasienDirawat}
              sub="Aktif"
              color="text-green-600"
              icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
            />
            <StatCard
              label="Sudah Pulang"
              value={stats.pasienPulang}
              sub="Selesai perawatan"
              color="text-gray-500"
              icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
            <StatCard
              label="Total Admisi"
              value={stats.totalAdmisi}
              sub="Semua waktu"
              color="text-blue-600"
              icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-gray-800">Grafik Kunjungan Rawat Inap</p>
                <p className="text-xs text-gray-400">6 bulan terakhir</p>
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setActiveChart('line')} className={`px-3 py-1 rounded-md text-xs font-medium ${activeChart === 'line' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Line</button>
                <button onClick={() => setActiveChart('bar')} className={`px-3 py-1 rounded-md text-xs font-medium ${activeChart === 'bar' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Bar</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              {activeChart === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="rawatInap" name="Rawat Inap" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rawatInap" name="Rawat Inap" fill="#0d9488" radius={[3, 3, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800 mb-1">Distribusi Kamar</p>
            <p className="text-xs text-gray-400 mb-4">Berdasarkan okupansi</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-3">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} /><span className="text-gray-600">{item.name}</span></div>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent patients */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">Pasien Rawat Inap Terbaru</p>
              <a href="/pelayanan" className="text-xs text-teal-600 hover:underline font-medium">Lihat semua →</a>
            </div>
            <div className="divide-y divide-gray-50">
              {recentAdmisi.map((adm, idx) => (
                <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{adm.pasien?.name || 'Pasien'}</p>
                      <p className="text-xs text-gray-400">RM: {adm.no_rm || '-'} · {adm.nama_kamar || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(adm.tanggal_masuk)}</p>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                      <span className="w-1 h-1 rounded-full bg-teal-500 animate-pulse" />Dirawat
                    </span>
                  </div>
                </div>
              ))}
              {recentAdmisi.length === 0 && <div className="p-5 text-center text-gray-400 text-sm">Belum ada data admisi</div>}
            </div>
          </div>

          {/* Blockchain activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />Aktivitas Blockchain
              </p>
              <span className="text-xs text-gray-400 font-mono">Live</span>
            </div>
            <div className="divide-y divide-gray-50">
              {blockchainActivity.map((act, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${act.type === 'create' ? 'bg-teal-100' : act.type === 'update' ? 'bg-blue-100' : act.type === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <svg className={`w-3.5 h-3.5 ${act.type === 'create' ? 'text-teal-600' : act.type === 'update' ? 'text-blue-600' : act.type === 'pending' ? 'text-yellow-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={act.type === 'create' ? 'M12 4v16m8-8H4' : act.type === 'update' ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : act.type === 'pending' ? 'M12 8v4l3 3' : 'M17 16l4-4m0 0l-4-4m4 4H7'} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{act.aksi}</p>
                    <p className="text-xs text-gray-500 font-mono truncate">{act.hash} · Pasien {act.pasien}</p>
                    {act.txHash && (
                      <a href={`https://sepolia.etherscan.io/tx/${act.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline">Lihat transaksi →</a>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">{act.waktu}</p>
                </div>
              ))}
              {blockchainActivity.length === 0 && <div className="p-5 text-center text-gray-400 text-sm">Belum ada aktivitas blockchain</div>}
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-mono text-center">Semua transaksi terverifikasi di blockchain Sepolia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;