import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BlockchainNotificationProvider } from './context/BlockchainNotificationContext';
import GlobalBlockchainNotification from './components/GlobalBlockchainNotification';
import Navbar from './components/navbar';
import LoginPage from './pages/login';
import Dashboard from './pages/dashboard';
import Pasien from './pages/pasien';
import AdmisiRawatInap from './pages/admisi_rawat_inap';
import Pelayanan from './pages/pelayanan ';
import ObservasiPasien from './pages/menu_pintasan/keperawatan/observasi_pasien';
import CPPT from './pages/menu_pintasan/cppt/ccpt';
import AsesMenMedis from './pages/menu_pintasan/asesmen_medis/asesmen_medis';
import PemeriksaanPasien from './pages/menu_pintasan/pemeriksaan_pasien/pemeriksaan_pasien';
import AsesMenKeperawatan from './pages/menu_pintasan/keperawatan/asesmen_awal/asesmen_awal';
import DetailPelayanan from './pages/detail/detail-pelayanan';
import ResepDetail from './pages/detail/resep';
import RegistrasiPasien from './pages/registrasi_pasien';
import BuatCPPT from './pages/menu_pintasan/pemeriksaan_pasien/buat_cppt';
import Farmasi from './pages/farmasi';
import Laboratorium from './pages/laboratorium';
import PermintaanKonsul from './pages/menu_pintasan/pemeriksaan_pasien/permintaan_konsul';
import Tindakan_medis from './pages/menu_pintasan/layanan_medis/layanan_medis';
import IGD from './pages/igd/igd';
import DetailIGD from './pages/igd/detail_igd';

// Komponen untuk Protected Route
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const userRole = localStorage.getItem('userRole');
  
  // Cek apakah user sudah login
  if (!token || !isAuthenticated || isAuthenticated !== 'true') {
    return <Navigate to="/login" replace />;
  }
  
  // Cek role jika diperlukan
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* Provider harus membungkus seluruh aplikasi */}
      <BlockchainNotificationProvider>
        <Routes>
          {/* Route Login (tanpa Navbar) */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes dengan Navbar */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-100 flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    {/* Dashboard - bisa diakses semua role */}
                    <Route path="/" element={<Dashboard />} />
                     <Route path="/laboratorium" element={<Laboratorium />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/dokter" element={<Dashboard />} />
                    <Route path="/dashboard/perawat" element={<Dashboard />} />
                    // Tambahkan route
<Route path="/farmasi" element={<Farmasi />} />
// Tambahkan route
<Route path="/permintaan-konsul" element={<PermintaanKonsul />} />
<Route path="/layanan_medis" element={<Tindakan_medis />} />
// Di dalam Routes
<Route path="/igd/detail/:id" element={<DetailIGD />} />
                    {/* Modul Pasien */}
                    <Route path="/pasien" element={<Pasien />} />
                    <Route path="/pasien/bayi-lahir" element={<Pasien />} />
                    <Route path="/pasien/meninggal" element={<Pasien />} />
                    <Route path="/pasien/kontrol" element={<Pasien />} />
                    <Route path="/pasien/rujuk-balik" element={<Pasien />} />
                    
                    <Route path="/registrasi-pasien" element={<RegistrasiPasien />} />
                    
                    {/* Modul Admisi */}
                    <Route path="/admisi" element={<AdmisiRawatInap />} />
                    
                    {/* Modul Pelayanan */}
                    <Route path="/igd" element={<IGD />} />  // ✅ benar
                    <Route path="/pelayanan" element={<Pelayanan />} />
                    <Route path="/detail/:id" element={<DetailPelayanan />} />
                    
                    {/* Menu Pintasan - Keperawatan */}
                    <Route path="/observasi_pasien" element={<ObservasiPasien />} />
                    <Route path="/asesmen_awal/asesmen_awal" element={<AsesMenKeperawatan />} />
                    
                    {/* Menu Pintasan - CPPT */}
                    <Route path="/cppt" element={<CPPT />} />
                    <Route path="/buat-cppt" element={<BuatCPPT />} />
                    
                    {/* Menu Pintasan - Asesmen Medis */}
                    <Route path="/asesmen-medis" element={<AsesMenMedis />} />
                    
                    {/* Menu Pintasan - Pemeriksaan Pasien */}
                    <Route path="/pemeriksaan-pasien" element={<PemeriksaanPasien />} />
                    
                    {/* Farmasi */}
                    <Route path="/resep" element={<ResepDetail />} />
                    <Route path="/farmasi" element={<ResepDetail />} />
                    
                    {/* Rekam Medis */}
                    <Route path="/rekam-medis" element={<div className="p-6"><h1 className="text-2xl font-bold">Rekam Medis</h1></div>} />
                    
                    {/* Laporan */}
                    <Route path="/laporan" element={<div className="p-6"><h1 className="text-2xl font-bold">Laporan</h1></div>} />
                    
                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                {/* Global Blockchain Notification - muncul di semua halaman */}
                <GlobalBlockchainNotification />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BlockchainNotificationProvider>
    </BrowserRouter>
  );
}

export default App;