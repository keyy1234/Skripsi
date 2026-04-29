import React, { useState, useRef, useEffect } from 'react';
import ToastNotification from '../../../components/ToastNotification';
import { useBlockchainNotification } from '../../../context/BlockchainNotificationContext';

const API_URL = 'http://localhost:5000';

const ICD10_LIST = [
  { kode: 'A01', nama: 'TYPHOID AND PARATYPHOID FEVERS' },
  { kode: 'A09', nama: 'DIARRHOEA AND GASTROENTERITIS' },
  { kode: 'B34.9', nama: 'VIRAL INFECTION, UNSPECIFIED' },
  { kode: 'E11', nama: 'TYPE 2 DIABETES MELLITUS' },
  { kode: 'I10', nama: 'ESSENTIAL (PRIMARY) HYPERTENSION' },
  { kode: 'I21', nama: 'ACUTE MYOCARDIAL INFARCTION' },
  { kode: 'J06.9', nama: 'ACUTE UPPER RESPIRATORY INFECTION' },
  { kode: 'J18', nama: 'PNEUMONIA, UNSPECIFIED ORGANISM' },
  { kode: 'K29.7', nama: 'GASTRITIS, UNSPECIFIED' },
  { kode: 'K35', nama: 'ACUTE APPENDICITIS' },
  { kode: 'N18', nama: 'CHRONIC KIDNEY DISEASE' },
  { kode: 'N39.0', nama: 'URINARY TRACT INFECTION' },
  { kode: 'R50.9', nama: 'FEVER, UNSPECIFIED' },
  { kode: 'S72.0', nama: 'FRACTURE OF FEMORAL NECK' },
  { kode: 'Z03.8', nama: 'OBSERVATION FOR OTHER SUSPECTED DISEASES' },
];

const ICD9_LIST = [
  { kode: '38.93', nama: 'Venous catheterization' },
  { kode: '57.94', nama: 'Insertion of indwelling urinary catheter' },
  { kode: '87.44', nama: 'Routine chest X-ray' },
  { kode: '88.71', nama: 'Diagnostic ultrasound of head and neck' },
  { kode: '89.52', nama: 'Electrocardiogram' },
  { kode: '90.5', nama: 'Microscopic examination of blood' },
  { kode: '96.04', nama: 'Insertion of endotracheal tube' },
  { kode: '99.04', nama: 'Transfusion of packed cells' },
  { kode: '99.15', nama: 'Parenteral infusion of concentrated nutritional substances' },
  { kode: '99.18', nama: 'Injection or infusion of electrolytes' },
];

// ── ICD Search dropdown ───────────────────────────────────────────────
const ICDSearch = ({ list, value, onChange, placeholder }) => {
  const [q, setQ] = useState(value ? `[${value.kode}] ${value.nama}` : '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const results = q.length >= 1 && !value
    ? list.filter(i => i.kode.toLowerCase().includes(q.toLowerCase()) || i.nama.toLowerCase().includes(q.toLowerCase()))
    : list;

  const handleSelect = (item) => {
    onChange(item);
    setQ(`[${item.kode}] ${item.nama}`);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQ('');
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-teal-500 bg-white">
        <svg className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); if (value) onChange(null); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
        />
        {value
          ? <button onClick={handleClear} className="px-3 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          : <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        }
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {results.length > 0 ? results.map(item => (
            <button key={item.kode} onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-blue-500 hover:text-white group transition-colors">
              <span className="font-mono font-bold text-xs mr-2 text-teal-600 group-hover:text-white">[{item.kode}]</span>
              <span className="text-sm">{item.nama}</span>
            </button>
          )) : <div className="px-4 py-4 text-sm text-gray-400 text-center">Tidak ditemukan</div>}
        </div>
      )}
    </div>
  );
};

// ── Diagnosa section ──────────────────────────────────────────────────
const DiagnosaSection = ({ onSave, isSaving }) => {
  const [utama, setUtama] = useState(null);
  const [utamaCatatan, setUtamaCatatan] = useState('');
  const [penyertaList, setPenyertaList] = useState([]);
  const [penyertaForm, setPenyertaForm] = useState({ icd: null, catatan: '', jenis: 'Penyerta' });
  const [error, setError] = useState('');

  const addPenyerta = () => {
    if (!penyertaForm.icd) {
      setError('Pilih diagnosa terlebih dahulu');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setPenyertaList(l => [...l, { ...penyertaForm, id: Date.now() }]);
    setPenyertaForm({ icd: null, catatan: '', jenis: 'Penyerta' });
    setError('');
  };

  const handleSave = () => {
    const data = {
      diagnosa_utama_kode: utama?.kode || null,
      diagnosa_utama_nama: utama?.nama || null,
      diagnosa_utama_catatan: utamaCatatan || null,
      diagnosa_penyerta: penyertaList.map(p => ({
        kode: p.icd?.kode,
        nama: p.icd?.nama,
        jenis: p.jenis,
        catatan: p.catatan
      })),
      prosedur: []
    };
    onSave(data);
  };

  return (
    <div className="space-y-7">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
      
      {/* Diagnosa Utama */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">Diagnosa Akhir — Utama</h3>
        <ICDSearch list={ICD10_LIST} value={utama} onChange={setUtama} placeholder="Cari Kode/Nama Penyakit (ICDX)" />
        <textarea
          rows={4}
          value={utamaCatatan}
          onChange={e => setUtamaCatatan(e.target.value)}
          placeholder="Gunakan kotak ini untuk menulis diagnosa pasien tanpa menggunakan format/kode ICDX"
          className="mt-2 w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 resize-y text-gray-500 placeholder-gray-300"
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* Penyerta & Komplikasi */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">Diagnosa Akhir — Penyerta &amp; Komplikasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div className="md:col-span-2">
            <ICDSearch list={ICD10_LIST} value={penyertaForm.icd} onChange={v => setPenyertaForm(f => ({ ...f, icd: v }))} placeholder="Cari Kode/Nama Penyakit (ICDX)" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jenis Diagnosa</label>
            <div className="relative">
              <select
                value={penyertaForm.jenis}
                onChange={e => setPenyertaForm(f => ({ ...f, jenis: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
              >
                <option>Penyerta</option>
                <option>Komplikasi</option>
                <option>Komorbid</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <textarea
          rows={3}
          value={penyertaForm.catatan}
          onChange={e => setPenyertaForm(f => ({ ...f, catatan: e.target.value }))}
          placeholder="Gunakan kotak ini untuk menulis diagnosa pasien tanpa menggunakan format/kode ICDX"
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none text-gray-500 placeholder-gray-300 mb-3"
        />
        <button
          onClick={addPenyerta}
          className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Diagnosa Penyerta &amp; Komplikasi
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Kode', 'Penyakit', 'Jenis Diagnosa', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {penyertaList.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-300">Belum ada diagnosa penyerta</td></tr>
            ) : penyertaList.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-mono font-bold text-teal-700 text-sm">{d.icd?.kode}</td>
                <td className="px-4 py-3 text-gray-800">{d.icd?.nama}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{d.jenis}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setPenyertaList(l => l.filter(x => x.id !== d.id))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Simpan Diagnosa
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Prosedur ICD-9 ────────────────────────────────────────────────────
const ProsedurSection = ({ onSave, isSaving }) => {
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ icd: null, catatan: '' });
  const [error, setError] = useState('');

  const add = () => {
    if (!form.icd) {
      setError('Pilih prosedur terlebih dahulu');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setSelected(l => [...l, { ...form, id: Date.now() }]);
    setForm({ icd: null, catatan: '' });
    setError('');
  };

  const handleSave = () => {
    const data = {
      diagnosa_utama_kode: null,
      diagnosa_utama_nama: null,
      diagnosa_utama_catatan: null,
      diagnosa_penyerta: [],
      prosedur: selected.map(p => ({
        kode: p.icd?.kode,
        nama: p.icd?.nama,
        catatan: p.catatan
      }))
    };
    onSave(data);
  };

  return (
    <div className="space-y-5">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
      
      <h3 className="text-sm font-bold text-gray-800">Prosedur ICD-9</h3>
      <ICDSearch list={ICD9_LIST} value={form.icd} onChange={v => setForm(f => ({ ...f, icd: v }))} placeholder="Cari Kode/Nama Prosedur (ICD-9)" />
      <textarea
        rows={3}
        value={form.catatan}
        onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
        placeholder="Catatan prosedur..."
        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
      />
      <button onClick={add} className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Tambah Prosedur
      </button>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Kode ICD-9', 'Nama Prosedur', 'Catatan', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {selected.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-300">Belum ada prosedur</td></tr>
            ) : selected.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-purple-700">{p.icd?.kode}</td>
                <td className="px-4 py-3 text-gray-800">{p.icd?.nama}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{p.catatan || '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(l => l.filter(x => x.id !== p.id))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Simpan Prosedur
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────
const LEFT_MENU = [
  { id: 'diagnosa', label: 'Diagnosa' },
  { id: 'prosedur', label: 'Prosedur ICD 9' },
];

const DiagnosaProsedur = ({ patient }) => {
  const [active, setActive] = useState('diagnosa');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { showBlockchainNotification, updateBlockchainNotification } = useBlockchainNotification();
  const token = localStorage.getItem('token');

  const handleSave = async (data) => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    const patientId = patient?.patient_id || patient?.pasien?.id || patient?.id;

    if (!patientId) {
      setError('Data pasien tidak ditemukan');
      setIsSaving(false);
      return;
    }

    showBlockchainNotification('pending', null, 'Menyimpan diagnosa & prosedur...');

    try {
      const response = await fetch(`${API_URL}/api/diagnosa-prosedur`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientId,
          admisi_id: patient?.id,
          no_registrasi: patient?.no_registrasi,
          ...data
        })
      });

      const result = await response.json();

      if (result.success) {
        updateBlockchainNotification('success', result.data?.blockchain_tx_hash, 'Diagnosa & Prosedur berhasil disimpan!');
        setSuccess('Data berhasil disimpan!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        updateBlockchainNotification('error', null, result.message || 'Gagal menyimpan');
        setError(result.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('Save error:', err);
      updateBlockchainNotification('error', null, 'Terjadi kesalahan saat menyimpan');
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-5">
      {error && (
        <div className="fixed top-20 right-4 z-50 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="fixed top-20 right-4 z-50 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Left sidebar */}
      <div className="w-44 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {LEFT_MENU.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-100 last:border-0 transition-colors"
              style={{
                background: active === item.id ? '#0d9488' : 'transparent',
                color: active === item.id ? '#fff' : '#4b5563',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-w-0">
        {active === 'diagnosa' && <DiagnosaSection onSave={handleSave} isSaving={isSaving} />}
        {active === 'prosedur' && <ProsedurSection onSave={handleSave} isSaving={isSaving} />}
      </div>
    </div>
  );
};

export default DiagnosaProsedur;