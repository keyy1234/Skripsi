import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Menu structure dengan submenu ─────────────────────────────────────
const MENU_STRUCTURE = [
  {
    type: 'single',
    label: 'Detail Kunjungan',
    path: '/detail-kunjungan',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    color: 'text-teal-600 font-semibold',
  },
  { type: 'divider' },
  {
    type: 'single',
    label: 'Asesmen Medis',
    path: '/asesmen-medis',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2',
  },
  {
    type: 'single',
    label: 'Pemeriksaan Pasien',
    path: '/pemeriksaan-pasien',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2',
  },
  {
    type: 'expandable',
    label: 'Tindakan/Layanan Medis',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    children: [
      { label: 'Pemberian Tindakan/Layanan Medis', path: '/layanan_medis' },
      { label: 'Uraian Tindakan Keperawatan/Kebidanan', path: '/uraian-tindakan-keperawatan' },
    ],
  },
  {
    type: 'single',
    label: 'CPPT',
    path: '/cppt',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  // {
  //   type: 'single',
  //   label: 'Ruang Rawat',
  //   path: '/ruang-rawat',
  //   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  // },
  {
    type: 'single',
    label: 'Pemeriksaan Penunjang',
    path: '/pemeriksaan-penunjang',
    icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    type: 'expandable',
    label: 'Farmasi',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    children: [
      { label: 'Buat Resep', path: '/resep' },
      { label: 'Rekonsiliasi Obat', path: '/farmasi/rekonsiliasi-obat' },
      { label: 'Rekam Pemberian Obat', path: '/farmasi/rekam-pemberian-obat' },
      { label: 'Riwayat Farmasi', path: '/farmasi/riwayat' },
    ],
  },
  {
    type: 'expandable',
    label: 'Keperawatan/Kebidanan',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    children: [
      { label: 'Asesmen Awal Keperawatan', path: '/asesmen_awal/asesmen_awal' },
      { label: 'Asesmen Resiko Jatuh', path: '/keperawatan/asesmen-resiko-jatuh' },
      { label: 'Asesmen Ulang & Intervensi Nyeri', path: '/keperawatan/asesmen-ulang-nyeri' },
      { label: 'Observasi Pasien', path: '/observasi_pasien' },
      { label: 'Diagnosa Keperawatan', path: '/keperawatan/diagnosa' },
      { label: 'Tujuan Keperawatan', path: '/keperawatan/tujuan' },
      { label: 'Intervensi Keperawatan', path: '/keperawatan/intervensi' },
    ],
  },
  {
    type: 'single',
    label: 'Rencana Keperawatan',
    path: '/rencana-keperawatan',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4',
  },
  {
    type: 'expandable',
    label: 'Konsul',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    children: [
      { label: 'Konsul Spesialis', path: '/konsul/spesialis' },
      { label: 'Konsul Anestesi', path: '/konsul/anestesi' },
      { label: 'Konsul Gizi', path: '/konsul/gizi' },
    ],
  },
  {
    type: 'expandable',
    label: 'Transfusi Darah',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    children: [
      { label: 'Observasi Transfusi Darah', path: '/transfusi-darah/observasi' },
    ],
  },
  {
    type: 'single',
    label: 'Lainnya',
    path: '/lainnya',
    icon: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
  },
  { type: 'divider' },
  {
    type: 'single',
    label: 'Form RME',
    path: '/form-rme',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
  {
    type: 'single',
    label: 'Detail RME',
    path: '/detail-rme',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  { type: 'divider' },
  {
    type: 'single',
    label: 'Formulir Transfer',
    path: '/formulir-transfer',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
  {
    type: 'single',
    label: 'Pemulangan Pasien',
    path: '/pemulangan-pasien',
    icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    color: 'text-teal-600 font-medium',
  },
  {
    type: 'single',
    label: 'Berkas',
    path: '/berkas',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  },
  { type: 'divider' },
  {
    type: 'single',
    label: 'Pasien Pulang',
    path: '/pasien-pulang',
    icon: 'M17 16l4-4m0 0l-4-4m4 4H7',
    color: 'text-teal-600 font-medium',
  },
  {
    type: 'single',
    label: 'Edit',
    path: '/edit',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    color: 'text-blue-600 font-medium',
  },
  {
    type: 'single',
    label: 'Batal',
    icon: 'M6 18L18 6M6 6l12 12',
    color: 'text-red-500 font-medium',
    isClose: true,
  },
];

// ── Expandable menu item ──────────────────────────────────────────────
const ExpandableItem = ({ item, onNavigate, patient }) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0);
    }
  }, [open]);

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors group text-gray-700"
      >
        <span className="flex items-center gap-2.5">
          <svg className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
          </svg>
          {item.label}
        </span>
        <svg
          className="w-3 h-3 text-gray-400 flex-shrink-0"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={contentRef}
        style={{
          maxHeight: height,
          overflow: 'hidden',
          transition: 'max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="bg-gray-50 py-1">
          {item.children.map((child, ci) => (
            <button
              key={child.label}
              onClick={() => child.path && onNavigate(child.path, patient)}
              className="w-full text-left px-5 py-2 text-xs text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors flex items-center gap-2"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(-6px)',
                transition: `opacity 0.2s ease ${ci * 0.04}s, transform 0.2s ease ${ci * 0.04}s`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300 flex-shrink-0" />
              {child.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────
const MenuPintasan = ({ patient, onClose }) => {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleNavigate = (path, patientData) => {
    // Kirim data pasien melalui state
    if (patientData) {
      navigate(path, { state: { patient: patientData } });
    } else {
      navigate(path);
    }
    onClose();
  };

  const handleMenuItemClick = (item) => {
    if (item.isClose) {
      onClose();
      return;
    }
    
    if (item.path) {
      handleNavigate(item.path, patient);
    }
  };

  // Format data pasien untuk ditampilkan
  const patientName = patient?.nama || patient?.name || patient?.pasien?.name || '-';
  const patientNoRM = patient?.noRM || patient?.no_rm || '-';
  const patientNoRegistrasi = patient?.noRegistrasi || patient?.no_registrasi || '-';
  const patientKamar = patient?.kamar || patient?.nama_kamar || '-';
  const patientStatus = patient?.status || 'dirawat';
  
  const isDirawat = patientStatus === 'aktif' || patientStatus === 'dirawat';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      <div
        ref={ref}
        className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col"
        style={{ animation: 'slideIn 0.18s ease-out' }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-700 to-teal-600 text-white flex-shrink-0">
          <span className="flex items-center gap-2 font-bold text-xs tracking-widest uppercase">
            <svg className="w-3.5 h-3.5 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Menu Pintasan
          </span>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Patient info */}
        <div className="px-4 py-3 bg-teal-50 border-b border-teal-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-teal-900 truncate">{patientName}</p>
              <p className="text-xs text-teal-600 font-mono">RM: {patientNoRM}</p>
            </div>
          </div>
          
          <div className="mt-2 space-y-1">
            <p className="text-xs text-teal-700 truncate flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No. Registrasi: {patientNoRegistrasi}
            </p>
            <p className="text-xs text-teal-700 truncate flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Kamar: {patientKamar}
            </p>
          </div>

          <div className="mt-3">
            {isDirawat ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Sedang Dirawat
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Sudah Pulang
              </span>
            )}
          </div>
        </div>

        {/* Menu items - Scrollable */}
        <div className="flex-1 overflow-y-auto py-2">
          {MENU_STRUCTURE.map((item, i) => {
            if (item.type === 'divider') {
              return <div key={i} className="my-1 mx-3 border-t border-gray-100" />;
            }

            if (item.type === 'expandable') {
              return <ExpandableItem key={item.label} item={item} onNavigate={handleNavigate} patient={patient} />;
            }

            // Single item
            return (
              <button
                key={item.label}
                onClick={() => handleMenuItemClick(item)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-teal-50 transition-colors group ${item.color || 'text-gray-700'}`}
              >
                <span className="flex items-center gap-2.5">
                  <svg
                    className={`w-4 h-4 flex-shrink-0 ${item.color ? '' : 'text-gray-400 group-hover:text-teal-500'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </span>
                {item.path && (
                  <svg className="w-3 h-3 text-gray-300 group-hover:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">MedicalChain - RME Blockchain</p>
        </div>
      </div>
    </>
  );
};

export default MenuPintasan;