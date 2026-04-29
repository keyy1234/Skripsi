import React, { useState, useRef, useEffect } from 'react';
import ToastNotification from '../../../components/ToastNotification';
import { useBlockchainNotification } from '../../../context/BlockchainNotificationContext';

const API_URL = 'http://localhost:5000';

const OBAT_CATALOG = [
  { nama: 'Amoxicillin 500mg', kategori: 'Antibiotik', satuan: 'Tablet' },
  { nama: 'Amoxicillin 250mg/5ml Sirup', kategori: 'Antibiotik', satuan: 'Botol' },
  { nama: 'Ciprofloxacin 500mg', kategori: 'Antibiotik', satuan: 'Tablet' },
  { nama: 'Metronidazole 500mg', kategori: 'Antibiotik', satuan: 'Tablet' },
  { nama: 'Paracetamol 500mg', kategori: 'Analgesik', satuan: 'Tablet' },
  { nama: 'Paracetamol Infus 1g/100ml', kategori: 'Analgesik', satuan: 'Flakon' },
  { nama: 'Ibuprofen 400mg', kategori: 'NSAID', satuan: 'Tablet' },
  { nama: 'Ketorolac 30mg/ml', kategori: 'NSAID', satuan: 'Ampul' },
  { nama: 'Omeprazole 20mg', kategori: 'GI', satuan: 'Kapsul' },
  { nama: 'Ranitidine 150mg', kategori: 'GI', satuan: 'Tablet' },
  { nama: 'Ondansetron 4mg', kategori: 'Antiemetik', satuan: 'Tablet' },
  { nama: 'Ondansetron 4mg/2ml', kategori: 'Antiemetik', satuan: 'Ampul' },
  { nama: 'Amlodipine 5mg', kategori: 'Antihipertensi', satuan: 'Tablet' },
  { nama: 'Amlodipine 10mg', kategori: 'Antihipertensi', satuan: 'Tablet' },
  { nama: 'Captopril 12.5mg', kategori: 'Antihipertensi', satuan: 'Tablet' },
  { nama: 'Ringer Laktat 500ml', kategori: 'Cairan Infus', satuan: 'Kantong' },
  { nama: 'NaCl 0.9% 500ml', kategori: 'Cairan Infus', satuan: 'Kantong' },
  { nama: 'Dextrose 5% 500ml', kategori: 'Cairan Infus', satuan: 'Kantong' },
  { nama: 'Cefixime 100mg', kategori: 'Antibiotik', satuan: 'Kapsul' },
  { nama: 'Metformin 500mg', kategori: 'Antidiabetik', satuan: 'Tablet' },
];

const FREKUENSI = ['-- Silakan Pilih --', '1x sehari', '2x sehari', '3x sehari', '4x sehari', 'Setiap 6 jam', 'Setiap 8 jam', 'Setiap 12 jam', 'Jika perlu'];
const WAKTU_MINUM = ['-- Silakan Pilih --', 'Sebelum makan', 'Sesudah makan', 'Bersama makan', 'Sebelum tidur'];
const RUTE = ['-- Silakan Pilih --', 'Oral', 'Intravena (IV)', 'Intramuskular (IM)', 'Subkutan (SC)', 'Suppositoria', 'Topikal', 'Inhalasi'];

const ObatSearch = ({ jenis, value, onChange }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const results = q.length >= 2 ? OBAT_CATALOG.filter(o => o.nama.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 bg-white">
        <svg className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={value ? value.nama : q}
          onChange={e => { setQ(e.target.value); setOpen(true); if (value) onChange(null); }}
          onFocus={() => setOpen(true)}
          placeholder="Cari Obat/BHP"
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
        />
        {value && (
          <button onClick={() => { onChange(null); setQ(''); }} className="px-3 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {q.length < 2 ? (
            <div className="px-4 py-4 text-sm text-gray-400 text-center">Masukkan 2 huruf lagi</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-400 text-center">Obat tidak ditemukan</div>
          ) : results.map(obat => (
            <button key={obat.nama} onClick={() => { onChange(obat); setOpen(false); setQ(''); }}
              className="w-full text-left px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-teal-500 hover:text-white group transition-colors">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-white">{obat.nama}</p>
              <p className="text-xs text-gray-400 group-hover:text-teal-100">{obat.kategori} · {obat.satuan}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SelectField = ({ options, value, onChange }) => (
  <div className="relative">
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

const Resep = ({ patient }) => {
  const [resepPulang, setResepPulang] = useState('Tidak');
  const [jenisObat, setJenisObat] = useState('Obat Jadi');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    obat: null,
    catatanObat: '',
    jumlah: '1',
    frekuensi: '-- Silakan Pilih --',
    waktu: '-- Silakan Pilih --',
    rute: '-- Silakan Pilih --',
    aturanObat: '',
    dosisBahan: '',
    instruksiPeracikan: '',
  });
  const [resepList, setResepList] = useState([]);

  const { showBlockchainNotification, updateBlockchainNotification } = useBlockchainNotification();
  const token = localStorage.getItem('token');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleTambah = () => {
    if (!form.obat && !form.catatanObat) {
      setError('Pilih obat atau isi catatan obat terlebih dahulu');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setResepList(l => [...l, { ...form, id: Date.now(), no: l.length + 1, jenisObat }]);
    setForm({ 
      obat: null, 
      catatanObat: '', 
      jumlah: '1', 
      frekuensi: '-- Silakan Pilih --', 
      waktu: '-- Silakan Pilih --', 
      rute: '-- Silakan Pilih --', 
      aturanObat: '', 
      dosisBahan: '', 
      instruksiPeracikan: '' 
    });
    setError('');
  };

  const handleSave = async () => {
    console.log('Save button clicked'); // Debug log
    
    if (resepList.length === 0) {
      setError('Tambahkan minimal satu resep terlebih dahulu');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const patientId = patient?.patient_id || patient?.pasien?.id || patient?.id;
    console.log('Patient ID:', patientId); // Debug log
    
    if (!patientId) {
      setError('Data pasien tidak ditemukan');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsSaving(true);
    setError('');
    
    showBlockchainNotification('pending', null, 'Menyimpan resep...');

    try {
      const payload = {
        patient_id: patientId,
        admisi_id: patient?.id,
        no_registrasi: patient?.no_registrasi,
        resep_pulang: resepPulang,
        items: resepList.map((item, idx) => ({
          no: idx + 1,
          jenis_obat: item.jenisObat,
          obat: item.obat,
          catatan_obat: item.catatanObat,
          jumlah: item.jumlah,
          satuan: item.obat?.satuan || 'pcs',
          frekuensi: item.frekuensi,
          waktu: item.waktu,
          rute: item.rute,
          aturan_obat: item.aturanObat,
          dosis_bahan: item.dosisBahan,
          instruksi_peracikan: item.instruksiPeracikan
        }))
      };

      console.log('Sending payload:', payload); // Debug log

      const response = await fetch(`${API_URL}/api/resep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('Response:', result); // Debug log

      if (result.success) {
        updateBlockchainNotification('success', result.data?.blockchain_tx_hash, 'Resep berhasil disimpan!');
        setSuccess('Resep berhasil disimpan!');
        setResepList([]);
        setResepPulang('Tidak');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        updateBlockchainNotification('error', null, result.message || 'Gagal menyimpan resep');
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

  // Jika tidak ada patient
  if (!patient) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
        <p className="text-gray-500">Tidak ada data pasien</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Resep Pulang */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Resep Pulang</label>
        <div className="flex items-center gap-6">
          {['Tidak', 'Iya'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" className="accent-teal-500 w-4 h-4" checked={resepPulang === opt} onChange={() => setResepPulang(opt)} />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Form input */}
      <div>
        <p className="text-sm font-bold text-gray-800 mb-4">Obat/BHP</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="w-36 flex-shrink-0">
                <SelectField options={['Obat Jadi', 'Obat Racikan', 'BHP', 'Alkes']} value={jenisObat} onChange={setJenisObat} />
              </div>
              <div className="flex-1">
                <ObatSearch jenis={jenisObat} value={form.obat} onChange={v => update('obat', v)} />
              </div>
            </div>

            <textarea
              rows={2}
              value={form.catatanObat}
              onChange={e => update('catatanObat', e.target.value)}
              placeholder="Gunakan kotak ini untuk menuliskan obat secara manual jika tidak ada di daftar"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jumlah</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus:ring-teal-500 max-w-xs">
                <input type="number" value={form.jumlah} onChange={e => update('jumlah', e.target.value)} className="flex-1 px-3 py-2 text-sm outline-none" />
                <span className="px-3 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500">{form.obat?.satuan || 'pcs'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aturan Pakai</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <SelectField options={FREKUENSI} value={form.frekuensi} onChange={v => update('frekuensi', v)} />
                <SelectField options={WAKTU_MINUM} value={form.waktu} onChange={v => update('waktu', v)} />
                <SelectField options={RUTE} value={form.rute} onChange={v => update('rute', v)} />
              </div>
              <input type="text" value={form.aturanObat} onChange={e => update('aturanObat', e.target.value)} placeholder="Aturan Obat (opsional)" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dosis Bahan</label>
              <textarea rows={4} value={form.dosisBahan} onChange={e => update('dosisBahan', e.target.value)} placeholder="Dosis Bahan Obat Racikan" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Instruksi Peracikan</label>
              <textarea rows={4} value={form.instruksiPeracikan} onChange={e => update('instruksiPeracikan', e.target.value)} placeholder="Instruksi Peracikan Obat" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-gray-50" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <button onClick={handleTambah} className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah
          </button>
        </div>
      </div>

      {/* Resep table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['No.', 'Obat/BHP', 'Aturan Pakai', 'Jumlah', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resepList.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-300">Belum ada resep ditambahkan</td></tr>
            ) : resepList.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.no}.</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800">{r.obat?.nama || r.catatanObat}</p>
                  <p className="text-xs text-gray-400">{r.jenisObat}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  <p>{r.frekuensi !== '-- Silakan Pilih --' ? r.frekuensi : '-'}</p>
                  <p>{r.waktu !== '-- Silakan Pilih --' ? r.waktu : ''}</p>
                </td>
                <td className="px-4 py-3 text-gray-800">{r.jumlah} {r.obat?.satuan || 'pcs'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setResepList(l => l.filter(x => x.id !== r.id))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4">
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Simpan Resep
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Resep;