import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Sample Data ──────────────────────────────────────────────────────────────
const permintaanData = [
  {
    id: 'LAB-2604-001', pasien: 'Andi Maulana', noRM: '045-2024', usia: '34 th',
    dokter: 'dr. Sari Dewi, Sp.PD', ruang: 'Poli Penyakit Dalam',
    tanggal: '29 Apr 2026', jam: '08:15',
    pemeriksaan: ['Darah Lengkap', 'Gula Darah Puasa', 'HbA1c'],
    prioritas: 'Rutin', status: 'Menunggu',
  },
  {
    id: 'LAB-2604-002', pasien: 'Rini Astuti', noRM: '072-2023', usia: '52 th',
    dokter: 'dr. Budi Santoso, Sp.JP', ruang: 'Poli Jantung',
    tanggal: '29 Apr 2026', jam: '08:45',
    pemeriksaan: ['Troponin I', 'CK-MB', 'LDH', 'Lipid Profil'],
    prioritas: 'Cito', status: 'Diproses',
  },
  {
    id: 'LAB-2604-003', pasien: 'Yusuf Hakim', noRM: '103-2025', usia: '28 th',
    dokter: 'dr. Nadia Putri, Sp.PK', ruang: 'IGD',
    tanggal: '29 Apr 2026', jam: '09:10',
    pemeriksaan: ['Darah Lengkap', 'Elektrolit', 'Urinalisis'],
    prioritas: 'Cito', status: 'Selesai',
  },
  {
    id: 'LAB-2604-004', pasien: 'Hana Wijayanti', noRM: '211-2024', usia: '41 th',
    dokter: 'dr. Ahmad Yusuf, Sp.OG', ruang: 'Poli Kandungan',
    tanggal: '29 Apr 2026', jam: '10:00',
    pemeriksaan: ['Darah Lengkap', 'Ferritin', 'TSH', 'FT4'],
    prioritas: 'Rutin', status: 'Selesai',
  },
  {
    id: 'LAB-2604-005', pasien: 'Darmawan Putra', noRM: '088-2022', usia: '61 th',
    dokter: 'dr. Sari Dewi, Sp.PD', ruang: 'Poli Penyakit Dalam',
    tanggal: '29 Apr 2026', jam: '10:30',
    pemeriksaan: ['Fungsi Ginjal', 'Asam Urat', 'Darah Lengkap'],
    prioritas: 'Rutin', status: 'Menunggu',
  },
];

const hasilData = {
  'LAB-2604-003': {
    pasien: 'Yusuf Hakim', noRM: '103-2025', tanggalHasil: '29 Apr 2026 10:05',
    analis: 'Rika Amelia, A.Md.AK',
    kelompok: [
      {
        nama: 'Darah Lengkap',
        items: [
          { parameter: 'Hemoglobin', nilai: '13.2', satuan: 'g/dL', rujukan: '13.0–17.0', flag: 'N' },
          { parameter: 'Leukosit', nilai: '11.8', satuan: '10³/µL', rujukan: '4.5–11.0', flag: 'H' },
          { parameter: 'Trombosit', nilai: '245', satuan: '10³/µL', rujukan: '150–400', flag: 'N' },
          { parameter: 'Hematokrit', nilai: '39.6', satuan: '%', rujukan: '40–52', flag: 'L' },
          { parameter: 'Eritrosit', nilai: '4.51', satuan: '10⁶/µL', rujukan: '4.5–5.9', flag: 'N' },
        ],
      },
      {
        nama: 'Elektrolit',
        items: [
          { parameter: 'Natrium (Na)', nilai: '138', satuan: 'mEq/L', rujukan: '136–145', flag: 'N' },
          { parameter: 'Kalium (K)', nilai: '3.2', satuan: 'mEq/L', rujukan: '3.5–5.1', flag: 'L' },
          { parameter: 'Klorida (Cl)', nilai: '101', satuan: 'mEq/L', rujukan: '98–107', flag: 'N' },
        ],
      },
      {
        nama: 'Urinalisis',
        items: [
          { parameter: 'Warna', nilai: 'Kuning', satuan: '-', rujukan: 'Kuning', flag: 'N' },
          { parameter: 'Glukosa Urin', nilai: 'Negatif', satuan: '-', rujukan: 'Negatif', flag: 'N' },
          { parameter: 'Protein Urin', nilai: '+1', satuan: '-', rujukan: 'Negatif', flag: 'H' },
          { parameter: 'Leukosit Urin', nilai: '5–8', satuan: '/lpb', rujukan: '0–5', flag: 'H' },
        ],
      },
    ],
  },
  'LAB-2604-004': {
    pasien: 'Hana Wijayanti', noRM: '211-2024', tanggalHasil: '29 Apr 2026 11:30',
    analis: 'Budi Kurniawan, A.Md.AK',
    kelompok: [
      {
        nama: 'Darah Lengkap',
        items: [
          { parameter: 'Hemoglobin', nilai: '10.1', satuan: 'g/dL', rujukan: '12.0–16.0', flag: 'L' },
          { parameter: 'Leukosit', nilai: '7.2', satuan: '10³/µL', rujukan: '4.5–11.0', flag: 'N' },
          { parameter: 'Trombosit', nilai: '312', satuan: '10³/µL', rujukan: '150–400', flag: 'N' },
        ],
      },
      {
        nama: 'Hormon Tiroid',
        items: [
          { parameter: 'TSH', nilai: '0.12', satuan: 'µIU/mL', rujukan: '0.27–4.20', flag: 'L' },
          { parameter: 'FT4', nilai: '2.45', satuan: 'ng/dL', rujukan: '0.93–1.70', flag: 'H' },
        ],
      },
    ],
  },
};

const statsRingkasan = [
  { label: 'Permintaan Hari Ini', value: 24, icon: '📋', color: '#185FA5', bgColor: '#E6F1FB' },
  { label: 'Menunggu', value: 8, icon: '⏳', color: '#854F0B', bgColor: '#FAEEDA' },
  { label: 'Sedang Diproses', value: 6, icon: '🔬', color: '#185FA5', bgColor: '#E6F1FB' },
  { label: 'Selesai Hari Ini', value: 10, icon: '✅', color: '#3B6D11', bgColor: '#EAF3DE' },
];

// ── Color helpers ─────────────────────────────────────────────────────────────
const statusStyle = {
  'Menunggu':  { bg: '#FAEEDA', color: '#854F0B', dot: '#EF9F27' },
  'Diproses':  { bg: '#E6F1FB', color: '#185FA5', dot: '#378ADD' },
  'Selesai':   { bg: '#EAF3DE', color: '#3B6D11', dot: '#639922' },
};
const prioritasStyle = {
  'Cito':  { bg: '#FCEBEB', color: '#A32D2D', border: '#E24B4A' },
  'Rutin': { bg: '#F1EFE8', color: '#5F5E5A', border: '#B4B2A9' },
};
const flagStyle = {
  'H': { bg: '#FCEBEB', color: '#A32D2D', label: '▲ Tinggi' },
  'L': { bg: '#E6F1FB', color: '#185FA5', label: '▼ Rendah' },
  'N': { bg: '#EAF3DE', color: '#3B6D11', label: 'Normal' },
};

// ── Component: Badge ─────────────────────────────────────────────────────────
const Badge = ({ text, style }) => (
  <span style={{
    borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
    letterSpacing: 0.3, whiteSpace: 'nowrap', ...style,
  }}>{text}</span>
);

// ── Component: Modal Hasil Lab ────────────────────────────────────────────────
const ModalHasil = ({ id, onClose }) => {
  const data = hasilData[id];
  if (!data) return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9aa5b4' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
          <p style={{ margin: 0, fontSize: 15, color: '#6b7a8d' }}>Hasil belum tersedia</p>
          <button onClick={onClose} style={closeBtnStyle}>Tutup</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalBoxStyle, maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#185FA5', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>
              Hasil Pemeriksaan Laboratorium
            </div>
            <h2 style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 700, color: '#0d1829' }}>{data.pasien}</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7a8d' }}>No. RM: {data.noRM} · {data.tanggalHasil}</p>
          </div>
          <button onClick={onClose} style={{
            background: '#f0f4f8', border: 'none', borderRadius: 8, width: 32, height: 32,
            cursor: 'pointer', fontSize: 16, color: '#6b7a8d', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        <div style={{ borderTop: '1px solid #eef1f5', paddingTop: 16, maxHeight: '60vh', overflowY: 'auto' }}>
          {data.kelompok.map((grp, gi) => (
            <div key={gi} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#185FA5', letterSpacing: 0.8,
                textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6,
                borderBottom: '2px solid #E6F1FB'
              }}>{grp.nama}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Parameter', 'Hasil', 'Satuan', 'Nilai Rujukan', 'Ket.'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#9aa5b4', fontWeight: 500, fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grp.items.map((item, ii) => (
                    <tr key={ii} style={{ background: ii % 2 === 0 ? '#fff' : '#f8fafd', borderRadius: 6 }}>
                      <td style={{ padding: '8px 10px', color: '#1a2332', fontWeight: 500 }}>{item.parameter}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: item.flag !== 'N' ? (item.flag === 'H' ? '#A32D2D' : '#185FA5') : '#1a2332' }}>
                        {item.nilai}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#6b7a8d' }}>{item.satuan}</td>
                      <td style={{ padding: '8px 10px', color: '#6b7a8d' }}>{item.rujukan}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          ...flagStyle[item.flag],
                          borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600
                        }}>{flagStyle[item.flag].label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #eef1f5', paddingTop: 14, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#9aa5b4' }}>Analis: <b style={{ color: '#4a5568' }}>{data.analis}</b></span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...actionBtnStyle, background: '#E6F1FB', color: '#185FA5', border: '1px solid #85B7EB' }}>
              🖨 Cetak
            </button>
            <button style={{ ...actionBtnStyle, background: '#0F6E56', color: '#fff', border: 'none' }}>
              ✓ Verifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(8,16,30,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 24,
};
const modalBoxStyle = {
  background: '#fff', borderRadius: 18, padding: '28px 28px 22px',
  maxWidth: 520, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
};
const closeBtnStyle = {
  marginTop: 20, background: '#f0f4f8', border: 'none', borderRadius: 8,
  padding: '8px 20px', cursor: 'pointer', color: '#4a5568', fontSize: 13,
};
const actionBtnStyle = {
  borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
};

// ── Modal Form Permintaan Baru ─────────────────────────────────────────────────
const ModalPermintaan = ({ onClose }) => {
  const [form, setForm] = useState({ pasien: '', noRM: '', dokter: '', ruang: '', prioritas: 'Rutin', catatan: '' });
  const [panel, setPanel] = useState([]);
  const panelOptions = ['Darah Lengkap', 'Kimia Darah', 'Gula Darah Puasa', 'HbA1c', 'Lipid Profil', 'Fungsi Ginjal', 'Fungsi Hati', 'Elektrolit', 'Troponin I', 'CK-MB', 'Urinalisis', 'Kultur Urin', 'TSH / FT4', 'Ferritin', 'Asam Urat'];

  const togglePanel = (p) => setPanel(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalBoxStyle, maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0d1829' }}>+ Permintaan Pemeriksaan Baru</h2>
          <button onClick={onClose} style={{ background: '#f0f4f8', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#6b7a8d' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {[{ label: 'Nama Pasien', key: 'pasien', placeholder: 'Nama lengkap' }, { label: 'No. Rekam Medis', key: 'noRM', placeholder: '000-0000' }, { label: 'Dokter Pengirim', key: 'dokter', placeholder: 'dr. Nama, Sp.XX' }, { label: 'Ruang / Poli', key: 'ruang', placeholder: 'Contoh: IGD, Poli Dalam' }].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, color: '#6b7a8d', fontWeight: 500, display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: '100%', border: '1px solid #d1d9e0', borderRadius: 8, padding: '9px 12px', fontSize: 13, background: '#f8fafc', color: '#1a2332', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#6b7a8d', fontWeight: 500, display: 'block', marginBottom: 6 }}>Prioritas</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Rutin', 'Cito'].map(p => (
              <button key={p} onClick={() => setForm(prev => ({ ...prev, prioritas: p }))} style={{
                flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: form.prioritas === p ? (p === 'Cito' ? '#FCEBEB' : '#EAF3DE') : '#f8fafc',
                color: form.prioritas === p ? (p === 'Cito' ? '#A32D2D' : '#3B6D11') : '#6b7a8d',
                border: `1.5px solid ${form.prioritas === p ? (p === 'Cito' ? '#E24B4A' : '#639922') : '#d1d9e0'}`,
              }}>{p === 'Cito' ? '🚨 CITO' : '📋 Rutin'}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#6b7a8d', fontWeight: 500, display: 'block', marginBottom: 8 }}>Panel Pemeriksaan</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {panelOptions.map(p => (
              <button key={p} onClick={() => togglePanel(p)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: panel.includes(p) ? '#0F6E56' : '#f0f4f8',
                color: panel.includes(p) ? '#fff' : '#4a5568',
                border: `1px solid ${panel.includes(p) ? '#0F6E56' : '#d1d9e0'}`,
                fontWeight: panel.includes(p) ? 600 : 400,
                transition: 'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
          {panel.length > 0 && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#185FA5' }}>{panel.length} panel dipilih</p>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: '#6b7a8d', fontWeight: 500, display: 'block', marginBottom: 4 }}>Catatan Klinis (opsional)</label>
          <textarea value={form.catatan} onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))}
            placeholder="Keterangan diagnosis sementara, kondisi khusus pasien..."
            rows={3}
            style={{ width: '100%', border: '1px solid #d1d9e0', borderRadius: 8, padding: '9px 12px', fontSize: 13, background: '#f8fafc', color: '#1a2332', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #d1d9e0', background: '#f8fafc', color: '#4a5568', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Batal</button>
          <button style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: '#0F6E56', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Kirim Permintaan →</button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const Laboratorium = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('permintaan');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterPrioritas, setFilterPrioritas] = useState('Semua');
  const [selectedId, setSelectedId] = useState(null);
  const [showPermintaanModal, setShowPermintaanModal] = useState(false);

  const filtered = permintaanData.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.pasien.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.noRM.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'Semua' || p.status === filterStatus;
    const matchPrioritas = filterPrioritas === 'Semua' || p.prioritas === filterPrioritas;
    return matchSearch && matchStatus && matchPrioritas;
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f0f4f8' }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #042C53 0%, #185FA5 55%, #0C447C 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 120, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', top: 20, right: 200, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '24px 24px 0' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, cursor: 'pointer' }} onClick={() => navigate('/')}>Dashboard</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>/</span>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Laboratorium</span>
          </div>

          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>🔬</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Laboratorium</h1>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Rekam Medis Elektronik · 29 April 2026</p>
              </div>
            </div>
            <button
              onClick={() => setShowPermintaanModal(true)}
              style={{
                background: '#fff', color: '#185FA5', border: 'none', borderRadius: 10,
                padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >+ Permintaan Baru</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            {statsRingkasan.map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px',
                border: '1px solid rgba(255,255,255,0.12)', flex: '1 1 140px',
                backdropFilter: 'blur(6px)',
              }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {[
              { key: 'permintaan', label: '📋 Daftar Permintaan' },
              { key: 'tracking', label: '📊 Tracking Status' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                background: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? '#185FA5' : 'rgba(255,255,255,0.7)',
                border: 'none', borderRadius: '10px 10px 0 0',
                padding: '10px 22px', fontSize: 14, fontWeight: activeTab === tab.key ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.2s'
              }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '24px 24px 60px' }}>

        {/* ── TAB: Daftar Permintaan ── */}
        {activeTab === 'permintaan' && (
          <div>
            {/* Filter bar */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 20,
              border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'
            }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍  Cari pasien, No.RM, atau ID lab..."
                style={{
                  flex: '1 1 220px', border: '1px solid #d1d9e0', borderRadius: 8,
                  padding: '9px 14px', fontSize: 14, outline: 'none', background: '#f8fafc', color: '#1a2332'
                }}
              />
              {[
                { label: 'Status', val: filterStatus, set: setFilterStatus, opts: ['Semua', 'Menunggu', 'Diproses', 'Selesai'] },
                { label: 'Prioritas', val: filterPrioritas, set: setFilterPrioritas, opts: ['Semua', 'Rutin', 'Cito'] },
              ].map(f => (
                <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)} style={{
                  border: '1px solid #d1d9e0', borderRadius: 8, padding: '9px 14px',
                  fontSize: 14, background: '#f8fafc', color: '#1a2332', outline: 'none', cursor: 'pointer'
                }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
              <span style={{ fontSize: 13, color: '#9aa5b4', whiteSpace: 'nowrap' }}>{filtered.length} dari {permintaanData.length} permintaan</span>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(item => {
                const st = statusStyle[item.status] || statusStyle['Menunggu'];
                const pr = prioritasStyle[item.prioritas];
                const hasHasil = !!hasilData[item.id];
                return (
                  <div key={item.id} style={{
                    background: '#fff', borderRadius: 14, padding: '18px 22px',
                    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
                    borderLeft: `4px solid ${st.dot}`,
                    transition: 'box-shadow 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(24,95,165,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
                  >
                    {/* Left: ID & waktu */}
                    <div style={{ minWidth: 130 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#185FA5', letterSpacing: 0.5, marginBottom: 4 }}>{item.id}</div>
                      <div style={{ fontSize: 12, color: '#9aa5b4' }}>{item.tanggal}</div>
                      <div style={{ fontSize: 12, color: '#9aa5b4' }}>{item.jam} WIB</div>
                    </div>

                    {/* Middle: Pasien info */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: '#E6F1FB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: '#185FA5', flexShrink: 0
                        }}>
                          {item.pasien.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#0d1829' }}>{item.pasien}</div>
                          <div style={{ fontSize: 12, color: '#9aa5b4' }}>No.RM: {item.noRM} · {item.usia}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>{item.dokter}</div>
                      <div style={{ fontSize: 12, color: '#9aa5b4' }}>{item.ruang}</div>
                    </div>

                    {/* Middle: Panel */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 12, color: '#9aa5b4', marginBottom: 6, fontWeight: 500 }}>PANEL PEMERIKSAAN</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {item.pemeriksaan.map(p => (
                          <span key={p} style={{
                            background: '#f0f4f8', color: '#4a5568', borderRadius: 6,
                            padding: '3px 8px', fontSize: 12, border: '1px solid #e2e8f0'
                          }}>{p}</span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Status & aksi */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 130 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Badge text={item.prioritas} style={{ background: pr.bg, color: pr.color, border: `1px solid ${pr.border}` }} />
                        <span style={{
                          background: st.bg, color: st.color, borderRadius: 20,
                          padding: '3px 10px', fontSize: 12, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                          {item.status}
                        </span>
                      </div>

                      {hasHasil ? (
                        <button
                          onClick={() => setSelectedId(item.id)}
                          style={{
                            background: '#0F6E56', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5
                          }}
                        >📄 Lihat Hasil</button>
                      ) : (
                        <button
                          style={{
                            background: '#f0f4f8', color: '#9aa5b4', border: '1px solid #e2e8f0', borderRadius: 8,
                            padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'default'
                          }}
                        >Belum Ada Hasil</button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔬</div>
                  <p style={{ margin: 0, fontSize: 15, color: '#6b7a8d' }}>Tidak ada permintaan yang sesuai filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Tracking ── */}
        {activeTab === 'tracking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {permintaanData.map(item => {
              const steps = ['Diterima', 'Sampling', 'Analisis', 'Verifikasi', 'Selesai'];
              const activeStep = item.status === 'Menunggu' ? 1 : item.status === 'Diproses' ? 2 : 4;
              return (
                <div key={item.id} style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#185FA5', letterSpacing: 0.5 }}>{item.id}</span>
                      <h3 style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: '#0d1829' }}>{item.pasien}</h3>
                      <p style={{ margin: 0, fontSize: 12, color: '#9aa5b4' }}>{item.pemeriksaan.join(' · ')}</p>
                    </div>
                    <Badge text={item.prioritas} style={{ background: prioritasStyle[item.prioritas].bg, color: prioritasStyle[item.prioritas].color, border: `1px solid ${prioritasStyle[item.prioritas].border}` }} />
                  </div>

                  {/* Progress steps */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {steps.map((step, i) => {
                      const done = i < activeStep;
                      const active = i === activeStep;
                      return (
                        <React.Fragment key={step}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i === steps.length - 1 ? '0 0 auto' : undefined }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: done ? '#0F6E56' : active ? '#185FA5' : '#f0f4f8',
                              border: `2px solid ${done ? '#0F6E56' : active ? '#185FA5' : '#d1d9e0'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, color: done || active ? '#fff' : '#9aa5b4', fontWeight: 700,
                              flexShrink: 0,
                            }}>
                              {done ? '✓' : i + 1}
                            </div>
                            <span style={{
                              fontSize: 10, marginTop: 4, color: done ? '#0F6E56' : active ? '#185FA5' : '#9aa5b4',
                              fontWeight: done || active ? 600 : 400, whiteSpace: 'nowrap'
                            }}>{step}</span>
                          </div>
                          {i < steps.length - 1 && (
                            <div style={{
                              flex: 1, height: 2, background: done ? '#0F6E56' : '#e2e8f0',
                              marginBottom: 16, minWidth: 20
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedId && <ModalHasil id={selectedId} onClose={() => setSelectedId(null)} />}
      {showPermintaanModal && <ModalPermintaan onClose={() => setShowPermintaanModal(false)} />}
    </div>
  );
};

export default Laboratorium;