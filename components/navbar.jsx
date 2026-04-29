import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    id: 'pasien',
    label: 'Pasien',
    path: '/pasien',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { label: 'Semua Pasien', path: '/pasien' },
      { label: 'Registrasi Pasien Baru', path: '/registrasi-pasien' },
      { label: 'Bayi Lahir', path: '/pasien/bayi-lahir' },
      { label: 'Meninggal', path: '/pasien/meninggal' },
      { label: 'Pasien Kontrol', path: '/pasien/kontrol' },
      { label: 'Pasien Rujuk Balik', path: '/pasien/rujuk-balik' },
    ]
  },
  {
    id: 'igd',
    label: 'IGD',
    path: '/igd',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    children: [
      { label: 'Triage Pasien', path: '/igd/triage' },
      { label: 'Antrian IGD', path: '/igd/antrian' },
      { label: 'Pasien Aktif', path: '/igd/pasien-aktif' },
      { label: 'Riwayat IGD', path: '/igd/riwayat' },
      { label: 'Laporan IGD', path: '/igd/laporan' },
    ]
  },
  {
    id: 'admisi',
    label: 'Admisi Rawat Inap',
    path: '/admisi',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  {
    id: 'pelayanan',
    label: 'Pelayanan',
    path: '/',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
     children: [
      { label: 'Rawat Darurat', path: '/igd' },
      { label: 'Rawat Inap', path: '/Pelayanan' },
    ]
  },
  {
    id: 'farmasi',
    label: 'Farmasi',
    path: '/farmasi',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  },
  {
    id: 'laboratorium',
    label: 'Laboratorium',
    path: '/laboratorium',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )
  },
  {
    id: 'rekam-medis',
    label: 'Rekam Medis',
    path: '/rekam-medis',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: 'laporan',
    label: 'Laporan',
    path: '/laporan',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
]

const DropdownMenu = ({ item, isMobile = false }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0)
    }
  }, [open])

  if (!item.children) {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap ${
            isActive
              ? 'bg-white/20 text-white'
              : 'text-white/75 hover:text-white hover:bg-white/10'
          }`
        }
      >
        {item.icon}
        {item.label}
      </NavLink>
    )
  }

  return (
    <div ref={ref} className={`relative ${isMobile ? 'w-full' : ''}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 rounded transition-colors whitespace-nowrap w-full"
      >
        {item.icon}
        {item.label}
        <svg
          className="w-3 h-3 ml-1"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Desktop — absolute dropdown with smooth fade + slide */}
      {!isMobile && (
        <div
          className="absolute top-full left-0 mt-1 w-56 bg-gray-800 rounded-md shadow-xl z-50 border border-gray-700/80 overflow-hidden"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0) scaleY(1)' : 'translateY(-8px) scaleY(0.95)',
            transformOrigin: 'top',
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="py-1">
            {item.children.map((child, ci) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateX(0)' : 'translateX(-4px)',
                  transition: `opacity 0.2s ease ${ci * 0.04}s, transform 0.2s ease ${ci * 0.04}s`,
                }}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Mobile — smooth max-height accordion */}
      {isMobile && (
        <div
          ref={contentRef}
          style={{
            maxHeight: height,
            overflow: 'hidden',
            transition: 'max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="ml-4 mt-1 bg-gray-800 rounded-md border border-gray-700/60 py-1">
            {item.children.map((child, ci) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateX(0)' : 'translateX(-4px)',
                  transition: `opacity 0.2s ease ${ci * 0.04}s, transform 0.2s ease ${ci * 0.04}s`,
                }}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const navigate = useNavigate()

  // Ambil data user dari localStorage (update dengan data dari login)
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const userName = userData.name || userData.userId || 'User'
  const userRoleText = userData.role === 'dokter_dpjp' ? 'Dokter DPJP' : (userData.role === 'perawat' ? 'Perawat' : 'Administrator')

  // Fungsi logout
  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      // Hapus semua data session
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      localStorage.removeItem('userRole')
      localStorage.removeItem('isAuthenticated')
      
      // Tampilkan toast notifikasi
      setShowToast(true)
      
      // Redirect ke halaman login setelah 1 detik
      setTimeout(() => {
        navigate('/login')
      }, 1000)
    }
  }

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ background: '#111827' }}>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Berhasil logout, mengalihkan ke halaman login...</span>
          </div>
        </div>
      )}

      {/* Row 1 — Brand + User */}
      <div className="border-b border-white/10 px-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between h-11">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 bg-teal-500 rounded-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <span className="text-white font-extrabold text-base tracking-tight">
                Medi<span className="text-teal-400">Block</span>
              </span>
              <span className="hidden sm:inline text-gray-500 text-xs ml-2 font-normal">
                — Rekam Medis Elektronik Berbasis Blockchain
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Chain status */}
            <div className="hidden md:flex items-center gap-1.5 bg-teal-900/40 border border-teal-700/50 rounded-full px-2.5 py-0.5 text-xs text-teal-400">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
              Chain Active
            </div>

            {/* User info */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
                <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-white text-xs font-semibold">{userName}</p>
                <p className="text-gray-400 text-xs">{userRoleText}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" 
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 — Nav menu */}
      <div className="hidden md:block px-4" style={{ background: '#1f2937' }}>
        <div className="max-w-screen-2xl mx-auto">
          <nav className="flex items-center h-10 gap-0.5">
            {menuItems.map((item) => (
              <DropdownMenu key={item.id} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-3 py-2" style={{ background: '#1f2937' }}>
          <nav className="flex flex-col gap-0.5">
            {menuItems.map((item) => (
              <DropdownMenu key={item.id} item={item} isMobile />
            ))}
          </nav>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </header>
  )
}

export default Navbar