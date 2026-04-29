import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { FormField, TextArea, TagGroup } from '../components/FormField';
import SaveBtn from '../components/SaveBtn';
import { PENYAKIT_OPTIONS, ALERGI_MAKANAN, ALERGI_OBAT } from '../data/constants';

const Anamnesis = forwardRef((props, ref) => {
  const [form, setForm] = useState({
    keluhanUtama: '',
    riwayatPenyakitPasien: '',
    riwayatKeluarga: '',
    alergiMakananList: [],
    alergiObatList: [],
  });

  // Expose method getData ke parent
  useImperativeHandle(ref, () => ({
    getData: () => {
      return {
        keluhan_utama: form.keluhanUtama,
        riwayat_penyakit_pasien: form.riwayatPenyakitPasien,
        riwayat_penyakit_keluarga: form.riwayatKeluarga,
        alergi_makanan: form.alergiMakananList,
        alergi_obat: form.alergiObatList,
      };
    }
  }));

  const toggleTag = (field, val) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val]
    }));
  };

  return (
    <div className="space-y-5">
      <FormField label="Keluhan Utama">
        <TextArea value={form.keluhanUtama} onChange={v => setForm(f => ({ ...f, keluhanUtama: v }))} rows={3} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Riwayat Penyakit Pasien">
          <TagGroup 
            tags={PENYAKIT_OPTIONS} 
            active={form.riwayatPenyakitPasien.split(',').map(s => s.trim()).filter(Boolean)} 
            onToggle={v => {
              const arr = form.riwayatPenyakitPasien.split(',').map(s => s.trim()).filter(Boolean);
              const next = arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
              setForm(f => ({ ...f, riwayatPenyakitPasien: next.join(', ') }));
            }} 
          />
          <TextArea value={form.riwayatPenyakitPasien} onChange={v => setForm(f => ({ ...f, riwayatPenyakitPasien: v }))} rows={3} />
        </FormField>
        <FormField label="Riwayat Penyakit Keluarga">
          <TagGroup 
            tags={PENYAKIT_OPTIONS} 
            active={form.riwayatKeluarga.split(',').map(s => s.trim()).filter(Boolean)} 
            onToggle={v => {
              const arr = form.riwayatKeluarga.split(',').map(s => s.trim()).filter(Boolean);
              const next = arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
              setForm(f => ({ ...f, riwayatKeluarga: next.join(', ') }));
            }} 
          />
          <TextArea value={form.riwayatKeluarga} onChange={v => setForm(f => ({ ...f, riwayatKeluarga: v }))} rows={3} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Alergi Makanan</p>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {ALERGI_MAKANAN.map((item, i) => (
              <label key={item} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition ${i < ALERGI_MAKANAN.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <input type="checkbox" className="accent-teal-500 w-4 h-4" checked={form.alergiMakananList.includes(item)} onChange={() => toggleTag('alergiMakananList', item)} />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Alergi Obat</p>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {ALERGI_OBAT.map((item, i) => (
              <label key={item} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition ${i < ALERGI_OBAT.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <input type="checkbox" className="accent-teal-500 w-4 h-4" checked={form.alergiObatList.includes(item)} onChange={() => toggleTag('alergiObatList', item)} />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <SaveBtn />
    </div>
  );
});

export default Anamnesis;