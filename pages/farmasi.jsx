import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';
import { useBlockchainNotification } from '../context/BlockchainNotificationContext';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  hijauGelap:  '#0B4F2E',
  hijau:       '#1A7A4A',
  hijauMuda:   '#2EAA6B',
  hijauPale:   '#E8F5EE',
  hijauLight:  '#C8E9D7',
  hitam:       '#0D1511',
  hitamSoft:   '#1C2B22',
  abuGelap:    '#2D3E35',
  abuMid:      '#6B7F74',
  abuLight:    '#B8C9BE',
  putih:       '#FFFFFF',
  putihSoft:   '#F4F9F6',
  putihBorder: '#E2EDE7',
  kuning:      '#F5A623',
  merah:       '#D94040',
  merahPale:   '#FDEAEA',
  biru:        '#2874C5',
  biruPale:    '#E8F0FB',
};

// Konfigurasi warna untuk asal resep
const asalCfg = {
  'Rawat Jalan': { bg: C.hijauPale, color: C.hijauGelap, border: C.hijauLight, icon: '🚶' },
  'Rawat Inap':  { bg: C.biruPale,  color: '#1A5BA8',   border: '#90BAE8',  icon: '🛏️' },
  'IGD':         { bg: C.merahPale, color: '#A02020',    border: '#F0A8A8', icon: '🚨' },
};

// ── Sample Data (ditambahkan field 'asal') ───────────────────────────────────
const resepData = [
  {
    id: 'RX-2604-001', noRM: '045-2024', pasien: 'Andi Maulana', usia: '34 th', gender: 'L',
    dokter: 'dr. Sari Dewi, Sp.PD', poli: 'Poli Penyakit Dalam',
    tanggal: '29 Apr 2026', jam: '09:20', status: 'Menunggu',
    asal: 'Rawat Jalan', // <-- ditambahkan
    obat: [
      { nama: 'Metformin 500mg', jumlah: '60 tablet', signa: '2×1 sesudah makan', jenis: 'Tablet' },
      { nama: 'Glimepiride 2mg', jumlah: '30 tablet', signa: '1×1 pagi hari', jenis: 'Tablet' },
    ],
    catatan: 'Pasien DM Tipe 2. Pantau gula darah rutin.',
  },
  {
    id: 'RX-2604-002', noRM: '072-2023', pasien: 'Rini Astuti', usia: '52 th', gender: 'P',
    dokter: 'dr. Budi Santoso, Sp.JP', poli: 'Poli Jantung',
    tanggal: '29 Apr 2026', jam: '09:45', status: 'Disiapkan',
    asal: 'Rawat Jalan',
    obat: [
      { nama: 'Bisoprolol 5mg', jumlah: '30 tablet', signa: '1×1 pagi', jenis: 'Tablet' },
      { nama: 'Amlodipine 10mg', jumlah: '30 tablet', signa: '1×1 malam', jenis: 'Tablet' },
      { nama: 'Aspirin 80mg', jumlah: '30 tablet', signa: '1×1 pagi sesudah makan', jenis: 'Tablet' },
    ],
    catatan: 'Riwayat hipertensi. Cek TD setiap kontrol.',
  },
  {
    id: 'RX-2604-003', noRM: '103-2025', pasien: 'Yusuf Hakim', usia: '28 th', gender: 'L',
    dokter: 'dr. Nadia Putri, Sp.PK', poli: 'IGD',
    tanggal: '29 Apr 2026', jam: '10:15', status: 'Selesai',
    asal: 'IGD', // <-- ditambahkan
    obat: [
      { nama: 'Amoksisilin 500mg', jumlah: '21 kapsul', signa: '3×1 habiskan', jenis: 'Kapsul' },
      { nama: 'Parasetamol 500mg', jumlah: '20 tablet', signa: '3×1 bila demam', jenis: 'Tablet' },
      { nama: 'OBH Combi Sirup', jumlah: '1 botol', signa: '3×1 cth (5ml)', jenis: 'Sirup' },
    ],
    catatan: '',
  },
  {
    id: 'RX-2604-004', noRM: '211-2024', pasien: 'Hana Wijayanti', usia: '41 th', gender: 'P',
    dokter: 'dr. Ahmad Yusuf, Sp.OG', poli: 'Poli Kandungan',
    tanggal: '29 Apr 2026', jam: '11:00', status: 'Menunggu',
    asal: 'Rawat Jalan',
    obat: [
      { nama: 'Tablet Fe 60mg', jumlah: '30 tablet', signa: '1×1 malam', jenis: 'Tablet' },
      { nama: 'Asam Folat 400mcg', jumlah: '30 tablet', signa: '1×1 pagi', jenis: 'Tablet' },
    ],
    catatan: 'Anemia ringan. Konsumsi vitamin C bersamaan.',
  },
  {
    id: 'RX-2604-005', noRM: '088-2022', pasien: 'Darmawan Putra', usia: '61 th', gender: 'L',
    dokter: 'dr. Sari Dewi, Sp.PD', poli: 'Poli Penyakit Dalam',
    tanggal: '29 Apr 2026', jam: '11:30', status: 'Disiapkan',
    asal: 'Rawat Inap', // <-- ditambahkan (contoh rawat inap)
    obat: [
      { nama: 'Allopurinol 300mg', jumlah: '30 tablet', signa: '1×1 sesudah makan', jenis: 'Tablet' },
      { nama: 'Kolkisin 0.5mg', jumlah: '20 tablet', signa: '2×1 saat serangan', jenis: 'Tablet' },
      { nama: 'Na Diklofenak 50mg', jumlah: '10 tablet', signa: '2×1 sesudah makan', jenis: 'Tablet' },
    ],
    catatan: 'Asam urat 9.2. Hindari jeroan dan kacang-kacangan.',
  },
];

const stokData = [
  { nama: 'Paracetamol 500mg', stok: 1240, satuan: 'tablet', kategori: 'Analgesik', status: 'Cukup' },
  { nama: 'Amoksisilin 500mg', stok: 320, satuan: 'kapsul', kategori: 'Antibiotik', status: 'Cukup' },
  { nama: 'Metformin 500mg', stok: 58, satuan: 'tablet', kategori: 'Antidiabetik', status: 'Hampir Habis' },
  { nama: 'Bisoprolol 5mg', stok: 12, satuan: 'tablet', kategori: 'Kardiologi', status: 'Kritis' },
  { nama: 'Amlodipine 10mg', stok: 210, satuan: 'tablet', kategori: 'Kardiologi', status: 'Cukup' },
  { nama: 'OBH Combi Sirup', stok: 45, satuan: 'botol', kategori: 'Antitusif', status: 'Hampir Habis' },
  { nama: 'Allopurinol 300mg', stok: 190, satuan: 'tablet', kategori: 'Antigout', status: 'Cukup' },
  { nama: 'Aspirin 80mg', stok: 7, satuan: 'tablet', kategori: 'Antiplatelet', status: 'Kritis' },
];

const statsData = [
  { label: 'Resep Masuk Hari Ini', value: 38, icon: '📄', color: C.hijau },
  { label: 'Menunggu Disiapkan', value: 12, icon: '⏳', color: C.kuning },
  { label: 'Sedang Disiapkan', value: 8, icon: '⚗', color: C.biru },
  { label: 'Selesai Diserahkan', value: 18, icon: '✅', color: C.hijauMuda },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const statusCfg = {
  'Menunggu':  { bg: '#FFF8E8', color: '#8A5E00', dot: C.kuning, border: '#F5D080' },
  'Disiapkan': { bg: C.biruPale, color: '#1A5BA8', dot: C.biru, border: '#90BAE8' },
  'Selesai':   { bg: C.hijauPale, color: C.hijauGelap, dot: C.hijauMuda, border: C.hijauLight },
};

const stokCfg = {
  'Cukup':       { bg: C.hijauPale, color: C.hijauGelap, border: C.hijauLight },
  'Hampir Habis':{ bg: '#FFF8E8',   color: '#8A5E00',    border: '#F5D080' },
  'Kritis':      { bg: C.merahPale, color: '#A02020',    border: '#F0A8A8' },
};

const jenisIcon = { Tablet: '💊', Kapsul: '🔵', Sirup: '🧴', Injeksi: '💉', Salep: '🟤' };

// ── Modal: Detail Resep (ditambahkan asal) ───────────────────────────────────
const ModalResep = ({ resep, onClose, onStatusChange }) => {
  if (!resep) return null;
  const st = statusCfg[resep.status];
  const asalStyle = asalCfg[resep.asal];
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(11,20,15,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:24 }} onClick={onClose}>
      <div style={{ background:C.putih,borderRadius:20,padding:'28px 30px 24px',maxWidth:540,width:'100%',boxShadow:'0 24px 64px rgba(0,0,0,0.25)',maxHeight:'90vh',overflowY:'auto' }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22 }}>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:C.hijau,letterSpacing:1,marginBottom:4 }}>RESEP #{resep.id}</div>
            <h2 style={{ margin:'0 0 2px',fontSize:19,fontWeight:800,color:C.hitam }}>{resep.pasien}</h2>
            <p style={{ margin:0,fontSize:13,color:C.abuMid }}>No.RM: {resep.noRM} · {resep.usia} · {resep.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
          </div>
          <button onClick={onClose} style={{ background:C.putihSoft,border:`1px solid ${C.putihBorder}`,borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:15,color:C.abuMid,display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
        </div>

        {/* Badge Asal */}
        <div style={{ marginBottom:16 }}>
          <span style={{ background:asalStyle.bg, color:asalStyle.color, border:`1px solid ${asalStyle.border}`, borderRadius:20, padding:'5px 12px', fontSize:12, fontWeight:700, display:'inline-flex', alignItems:'center', gap:6 }}>
            {asalStyle.icon} {resep.asal}
          </span>
        </div>

        {/* Dokter & Waktu */}
        <div style={{ background:C.putihSoft,borderRadius:12,padding:'14px 16px',marginBottom:18,border:`1px solid ${C.putihBorder}` }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,fontSize:13 }}>
            {[['Dokter Peresep', resep.dokter],['Poli / Unit', resep.poli],['Tanggal', resep.tanggal],['Jam', resep.jam + ' WIB']].map(([lbl,val]) => (
              <div key={lbl}>
                <div style={{ fontSize:11,color:C.abuLight,marginBottom:2,fontWeight:600 }}>{lbl}</div>
                <div style={{ color:C.hitamSoft,fontWeight:600 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daftar Obat */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11,fontWeight:700,color:C.hijau,letterSpacing:0.8,marginBottom:10 }}>DAFTAR OBAT</div>
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {resep.obat.map((ob,i) => (
              <div key={i} style={{ background:C.putihSoft,border:`1px solid ${C.putihBorder}`,borderRadius:10,padding:'12px 14px',display:'flex',gap:12,alignItems:'flex-start' }}>
                <div style={{ width:36,height:36,borderRadius:8,background:C.hijauPale,border:`1px solid ${C.hijauLight}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>
                  {jenisIcon[ob.jenis] || '💊'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:14,color:C.hitam }}>{ob.nama}</div>
                  <div style={{ fontSize:12,color:C.abuMid,marginTop:2 }}>
                    <span style={{ background:C.hijauPale,color:C.hijauGelap,borderRadius:5,padding:'1px 7px',fontSize:11,fontWeight:600,marginRight:6 }}>{ob.jumlah}</span>
                    {ob.signa}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {resep.catatan && (
          <div style={{ background:'#FFFBEA',border:'1px solid #F5D080',borderRadius:10,padding:'10px 14px',marginBottom:18,fontSize:13,color:'#6B4A00',display:'flex',gap:8 }}>
            <span>⚠️</span><span>{resep.catatan}</span>
          </div>
        )}

        {/* Status & Aksi */}
        <div style={{ borderTop:`1px solid ${C.putihBorder}`,paddingTop:16,display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap' }}>
          <span style={{ ...st,borderRadius:20,padding:'5px 14px',fontSize:13,fontWeight:700,border:`1px solid ${st.border}`,display:'flex',alignItems:'center',gap:6 }}>
            <span style={{ width:8,height:8,borderRadius:'50%',background:st.dot,display:'inline-block' }} />{resep.status}
          </span>
          <div style={{ display:'flex',gap:8 }}>
            {resep.status === 'Menunggu' && (
              <button onClick={() => onStatusChange(resep.id,'Disiapkan')} style={{ background:C.biru,color:'#fff',border:'none',borderRadius:9,padding:'9px 16px',fontSize:13,fontWeight:700,cursor:'pointer' }}>
                ⚗ Mulai Siapkan
              </button>
            )}
            {resep.status === 'Disiapkan' && (
              <button onClick={() => onStatusChange(resep.id,'Selesai')} style={{ background:C.hijau,color:'#fff',border:'none',borderRadius:9,padding:'9px 16px',fontSize:13,fontWeight:700,cursor:'pointer' }}>
                ✓ Serahkan ke Pasien
              </button>
            )}
            <button style={{ background:C.putihSoft,border:`1px solid ${C.putihBorder}`,borderRadius:9,padding:'9px 14px',fontSize:13,color:C.abuGelap,cursor:'pointer',fontWeight:600 }}>
              🖨 Cetak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const Farmasi = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('resep');
  const [resepList, setResepList] = useState(resepData);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterAsal, setFilterAsal] = useState('Semua'); // <-- state filter asal baru
  const [selectedResep, setSelectedResep] = useState(null);
  const [stokSearch, setStokSearch] = useState('');
  const [filterStok, setFilterStok] = useState('Semua');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleStatusChange = (id, newStatus) => {
    setResepList(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    setSelectedResep(prev => prev ? { ...prev, status: newStatus } : null);
    showToast(newStatus === 'Disiapkan' ? 'Resep sedang disiapkan' : 'Obat berhasil diserahkan ke pasien ✓');
  };

  // Filter resep: tambahkan filter asal
  const filteredResep = resepList.filter(r => {
    const q = search.toLowerCase();
    const matchQ = r.pasien.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.noRM.toLowerCase().includes(q);
    const matchS = filterStatus === 'Semua' || r.status === filterStatus;
    const matchA = filterAsal === 'Semua' || r.asal === filterAsal; // <-- filter asal
    return matchQ && matchS && matchA;
  });

  const filteredStok = stokData.filter(s => {
    const matchQ = s.nama.toLowerCase().includes(stokSearch.toLowerCase()) || s.kategori.toLowerCase().includes(stokSearch.toLowerCase());
    const matchF = filterStok === 'Semua' || s.status === filterStok;
    return matchQ && matchF;
  });

  const kritisCount = stokData.filter(s => s.status === 'Kritis').length;
  const hampirHabisCount = stokData.filter(s => s.status === 'Hampir Habis').length;

  return (
    <div style={{ fontFamily:"'DM Sans', 'Segoe UI', sans-serif", minHeight:'100vh', background:C.putihSoft }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── HEADER (tidak berubah) ── */}
      <div style={{ background:`linear-gradient(135deg, ${C.hitam} 0%, ${C.hitamSoft} 40%, ${C.hijauGelap} 100%)`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(42,170,107,0.08)' }} />
        <div style={{ position:'absolute', bottom:-50, left:60, width:200, height:200, borderRadius:'50%', background:'rgba(42,170,107,0.05)' }} />
        <div style={{ position:'absolute', top:40, right:220, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${C.hijauMuda}, ${C.hijau}, transparent)` }} />

        <div style={{ maxWidth:1140, margin:'0 auto', padding:'24px 24px 0', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
            <span style={{ color:'rgba(255,255,255,0.45)', fontSize:13, cursor:'pointer' }} onClick={() => navigate('/')}>Dashboard</span>
            <span style={{ color:'rgba(255,255,255,0.25)', fontSize:12 }}>/</span>
            <span style={{ color:C.hijauMuda, fontSize:13, fontWeight:600 }}>Farmasi</span>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:'rgba(42,170,107,0.15)', border:'1px solid rgba(42,170,107,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>💊</div>
              <div>
                <h1 style={{ margin:0, fontSize:25, fontWeight:800, color:C.putih, letterSpacing:'-0.5px' }}>Instalasi Farmasi</h1>
                <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.55)' }}>Rekam Medis Elektronik · 29 April 2026</p>
              </div>
            </div>
            {(kritisCount > 0 || hampirHabisCount > 0) && (
              <div style={{ background:'rgba(217,64,64,0.15)', border:'1px solid rgba(217,64,64,0.35)', borderRadius:10, padding:'8px 16px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14 }}>⚠️</span>
                <span style={{ fontSize:13, color:'#F5A0A0', fontWeight:600 }}>
                  {kritisCount} stok kritis · {hampirHabisCount} hampir habis
                </span>
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
            {statsData.map((s,i) => (
              <div key={i} style={{ flex:'1 1 140px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'14px 18px', backdropFilter:'blur(6px)' }}>
                <div style={{ fontSize:18, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:26, fontWeight:800, color:C.putih, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:2 }}>
            {[{ key:'resep',label:'📄 Daftar Resep' },{ key:'stok',label:'📦 Stok Obat' },{ key:'riwayat',label:'🕐 Riwayat' }].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                background: activeTab === t.key ? C.putih : 'transparent',
                color: activeTab === t.key ? C.hijauGelap : 'rgba(255,255,255,0.6)',
                border:'none', borderRadius:'10px 10px 0 0',
                padding:'10px 22px', fontSize:14, fontWeight: activeTab === t.key ? 700 : 400,
                cursor:'pointer', transition:'all 0.2s'
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth:1140, margin:'0 auto', padding:'24px 24px 60px' }}>

        {/* ── TAB RESEP (ditambahkan filter asal) ── */}
        {activeTab === 'resep' && (
          <div>
            <div style={{ background:C.putih, borderRadius:14, padding:'16px 20px', marginBottom:20, border:`1px solid ${C.putihBorder}`, boxShadow:`0 2px 8px rgba(11,79,46,0.06)`, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Cari nama pasien, No.RM, atau ID resep..."
                style={{ flex:'1 1 220px', border:`1px solid ${C.putihBorder}`, borderRadius:8, padding:'9px 14px', fontSize:14, outline:'none', background:C.putihSoft, color:C.hitam }} />
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ border:`1px solid ${C.putihBorder}`, borderRadius:8, padding:'9px 14px', fontSize:14, background:C.putihSoft, color:C.hitam, outline:'none', cursor:'pointer' }}>
                {['Semua','Menunggu','Disiapkan','Selesai'].map(o => <option key={o}>{o}</option>)}
              </select>
              {/* Filter Asal */}
              <select value={filterAsal} onChange={e=>setFilterAsal(e.target.value)} style={{ border:`1px solid ${C.putihBorder}`, borderRadius:8, padding:'9px 14px', fontSize:14, background:C.putihSoft, color:C.hitam, outline:'none', cursor:'pointer' }}>
                {['Semua', 'Rawat Jalan', 'Rawat Inap', 'IGD'].map(o => <option key={o}>{o}</option>)}
              </select>
              <span style={{ fontSize:13, color:C.abuLight, whiteSpace:'nowrap' }}>{filteredResep.length} resep</span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {filteredResep.map(resep => {
                const st = statusCfg[resep.status];
                const asalStyle = asalCfg[resep.asal];
                return (
                  <div key={resep.id}
                    onClick={() => setSelectedResep(resep)}
                    style={{
                      background:C.putih, borderRadius:14, padding:'18px 22px',
                      border:`1px solid ${C.putihBorder}`, boxShadow:`0 1px 4px rgba(0,0,0,0.04)`,
                      display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap',
                      borderLeft:`4px solid ${st.dot}`, cursor:'pointer',
                      transition:'box-shadow 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 6px 20px rgba(11,79,46,0.12)`; e.currentTarget.style.transform='translateY(-1px)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.boxShadow=`0 1px 4px rgba(0,0,0,0.04)`; e.currentTarget.style.transform='translateY(0)'; }}
                  >
                    <div style={{ minWidth:130 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:C.hijau, letterSpacing:0.5, marginBottom:4 }}>{resep.id}</div>
                      <div style={{ fontSize:12, color:C.abuLight }}>{resep.tanggal}</div>
                      <div style={{ fontSize:12, color:C.abuLight }}>{resep.jam} WIB</div>
                    </div>

                    <div style={{ flex:1, minWidth:180 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:C.hijauPale, border:`1px solid ${C.hijauLight}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:C.hijauGelap, flexShrink:0 }}>
                          {resep.pasien.split(' ').map(w=>w[0]).slice(0,2).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:15, color:C.hitam }}>{resep.pasien}</div>
                          <div style={{ fontSize:12, color:C.abuMid }}>No.RM: {resep.noRM} · {resep.usia} · {resep.gender}</div>
                        </div>
                      </div>
                      <div style={{ fontSize:13, color:C.abuGelap, marginTop:4 }}>{resep.dokter}</div>
                      <div style={{ fontSize:12, color:C.abuLight }}>{resep.poli}</div>
                    </div>

                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ fontSize:11, color:C.abuLight, marginBottom:6, fontWeight:600 }}>OBAT DIRESEPKAN</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        {resep.obat.slice(0,3).map((ob,i) => (
                          <div key={i} style={{ fontSize:13, color:C.abuGelap, display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:14 }}>{jenisIcon[ob.jenis] || '💊'}</span>
                            <span style={{ fontWeight:500 }}>{ob.nama}</span>
                            <span style={{ color:C.abuLight, fontSize:12 }}>({ob.jumlah})</span>
                          </div>
                        ))}
                        {resep.obat.length > 3 && <div style={{ fontSize:12, color:C.abuLight }}>+{resep.obat.length - 3} obat lainnya</div>}
                      </div>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10, minWidth:140 }}>
                      {/* Badge Asal */}
                      <span style={{ background:asalStyle.bg, color:asalStyle.color, border:`1px solid ${asalStyle.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 }}>
                        {asalStyle.icon} {resep.asal}
                      </span>
                      <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`, borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:st.dot, display:'inline-block' }} />
                        {resep.status}
                      </span>
                      <button onClick={e=>{ e.stopPropagation(); setSelectedResep(resep); }} style={{
                        background:resep.status==='Selesai' ? C.hijauPale : C.hijau,
                        color:resep.status==='Selesai' ? C.hijauGelap : C.putih,
                        border:`1px solid ${resep.status==='Selesai' ? C.hijauLight : C.hijau}`,
                        borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer'
                      }}>
                        {resep.status === 'Selesai' ? '📄 Detail' : '⚗ Proses'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredResep.length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 24px', background:C.putih, borderRadius:14, border:`1px solid ${C.putihBorder}` }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>💊</div>
                  <p style={{ margin:0, fontSize:15, color:C.abuMid }}>Tidak ada resep yang sesuai.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB STOK (tidak berubah) ── */}
        {activeTab === 'stok' && (
          <div>
            {(kritisCount > 0 || hampirHabisCount > 0) && (
              <div style={{ background:C.merahPale, border:`1px solid #F0A8A8`, borderRadius:12, padding:'14px 20px', marginBottom:18, display:'flex', gap:12, alignItems:'center' }}>
                <span style={{ fontSize:20 }}>🚨</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:'#A02020' }}>Peringatan Stok</div>
                  <div style={{ fontSize:13, color:'#C04040' }}>
                    {stokData.filter(s=>s.status==='Kritis').map(s=>s.nama).join(', ')} — stok kritis, segera lakukan pengadaan.
                  </div>
                </div>
              </div>
            )}

            <div style={{ background:C.putih, borderRadius:14, padding:'16px 20px', marginBottom:20, border:`1px solid ${C.putihBorder}`, boxShadow:`0 2px 8px rgba(11,79,46,0.06)`, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
              <input value={stokSearch} onChange={e=>setStokSearch(e.target.value)} placeholder="🔍  Cari nama obat atau kategori..."
                style={{ flex:'1 1 200px', border:`1px solid ${C.putihBorder}`, borderRadius:8, padding:'9px 14px', fontSize:14, outline:'none', background:C.putihSoft, color:C.hitam }} />
              <select value={filterStok} onChange={e=>setFilterStok(e.target.value)} style={{ border:`1px solid ${C.putihBorder}`, borderRadius:8, padding:'9px 14px', fontSize:14, background:C.putihSoft, color:C.hitam, outline:'none', cursor:'pointer' }}>
                {['Semua','Cukup','Hampir Habis','Kritis'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
              {filteredStok.map((s,i) => {
                const cfg = stokCfg[s.status];
                const pct = Math.min(100, Math.round(s.stok / 1500 * 100));
                return (
                  <div key={i} style={{ background:C.putih, borderRadius:14, padding:'18px 20px', border:`1px solid ${C.putihBorder}`, boxShadow:`0 1px 4px rgba(0,0,0,0.04)`, borderTop:`3px solid ${cfg.border}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:C.hitam, marginBottom:2 }}>{s.nama}</div>
                        <div style={{ fontSize:12, color:C.abuLight }}>{s.kategori}</div>
                      </div>
                      <span style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
                        {s.status}
                      </span>
                    </div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:10 }}>
                      <span style={{ fontSize:28, fontWeight:800, color: s.status==='Kritis' ? C.merah : s.status==='Hampir Habis' ? C.kuning : C.hijau }}>{s.stok}</span>
                      <span style={{ fontSize:13, color:C.abuLight }}>{s.satuan}</span>
                    </div>
                    <div style={{ background:C.putihBorder, borderRadius:20, height:6, overflow:'hidden' }}>
                      <div style={{ height:6, borderRadius:20, width:`${pct}%`, background: s.status==='Kritis' ? C.merah : s.status==='Hampir Habis' ? C.kuning : C.hijauMuda, transition:'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize:11, color:C.abuLight, marginTop:6 }}>Tersisa {pct}% dari kapasitas</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB RIWAYAT (ditambahkan kolom Asal) ── */}
        {activeTab === 'riwayat' && (
          <div style={{ background:C.putih, borderRadius:14, border:`1px solid ${C.putihBorder}`, overflow:'hidden', boxShadow:`0 2px 8px rgba(11,79,46,0.06)` }}>
            <div style={{ padding:'18px 22px', borderBottom:`1px solid ${C.putihBorder}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:C.hitam }}>🕐 Riwayat Penyerahan Obat</h2>
              <span style={{ fontSize:13, color:C.abuLight }}>29 Apr 2026</span>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ background:C.putihSoft }}>
                    {['ID Resep','Pasien','Dokter','Jumlah Obat','Asal','Diserahkan Oleh','Jam','Status'].map(h => (
                      <th key={h} style={{ padding:'12px 18px', textAlign:'left', color:C.abuMid, fontWeight:600, borderBottom:`1px solid ${C.putihBorder}`, fontSize:12, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resepList.filter(r=>r.status==='Selesai').map((r,i) => {
                    const asalStyle = asalCfg[r.asal];
                    return (
                      <tr key={r.id} style={{ borderBottom:`1px solid ${C.putihSoft}`, background: i%2===0 ? C.putih : C.putihSoft, cursor:'pointer' }}
                        onClick={() => setSelectedResep(r)}
                        onMouseEnter={e=>e.currentTarget.style.background=C.hijauPale}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.putih:C.putihSoft}
                      >
                        <td style={{ padding:'13px 18px', color:C.hijau, fontWeight:700, fontSize:13 }}>{r.id}</td>
                        <td style={{ padding:'13px 18px', fontWeight:600, color:C.hitam }}>{r.pasien}</td>
                        <td style={{ padding:'13px 18px', color:C.abuGelap }}>{r.dokter}</td>
                        <td style={{ padding:'13px 18px', color:C.abuGelap, textAlign:'center' }}>{r.obat.length} item</td>
                        <td style={{ padding:'13px 18px' }}>
                          <span style={{ background:asalStyle.bg, color:asalStyle.color, border:`1px solid ${asalStyle.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 }}>
                            {asalStyle.icon} {r.asal}
                          </span>
                        </td>
                        <td style={{ padding:'13px 18px', color:C.abuGelap }}>Apt. Dewi R., S.Farm</td>
                        <td style={{ padding:'13px 18px', color:C.abuMid, fontFamily:'monospace' }}>{r.jam}</td>
                        <td style={{ padding:'13px 18px' }}>
                          <span style={{ background:C.hijauPale, color:C.hijauGelap, border:`1px solid ${C.hijauLight}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:700 }}>✓ Selesai</span>
                        </td>
                      </tr>
                    );
                  })}
                  {resepList.filter(r=>r.status==='Selesai').length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign:'center', padding:'40px', color:C.abuLight, fontSize:14 }}>Belum ada riwayat hari ini</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {selectedResep && (
        <ModalResep
          resep={resepList.find(r=>r.id===selectedResep.id)}
          onClose={() => setSelectedResep(null)}
          onStatusChange={(id, status) => { handleStatusChange(id, status); setSelectedResep(null); }}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <ToastNotification
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Farmasi;