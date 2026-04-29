import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { FormField, Input, RadioGroup, Select } from '../components/FormField';
import SaveBtn from '../components/SaveBtn';
import { E_OPTIONS, V_OPTIONS, M_OPTIONS } from '../data/constants';

const TTV = forwardRef((props, ref) => {
  const [ku, setKu] = useState('Baik');
  const [gcs, setGcs] = useState({ E: '4', V: '5', M: '6' });
  const [vitals, setVitals] = useState({ 
    nadi: '75', sistolik: '120', diastolik: '70', suhu: '36', 
    nafas: '40', spo2: '40', tinggi: '0.00', berat: '0.00' 
  });

  useImperativeHandle(ref, () => ({
    getData: () => {
      return {
        keadaan_umum: ku,
        gcs_e: gcs.E,
        gcs_v: gcs.V,
        gcs_m: gcs.M,
        nadi: vitals.nadi,
        tekanan_darah_sistolik: vitals.sistolik,
        tekanan_darah_diastolik: vitals.diastolik,
        suhu: vitals.suhu,
        nafas: vitals.nafas,
        spo2: vitals.spo2,
        tinggi_badan: vitals.tinggi,
        berat_badan: vitals.berat,
      };
    }
  }));

  const gcsTotal = (parseInt(gcs.E) || 0) + (parseInt(gcs.V) || 0) + (parseInt(gcs.M) || 0);
  const gcsLabel = gcsTotal >= 14 ? 'Compos Mentis' : gcsTotal >= 9 ? 'Somnolen' : gcsTotal >= 6 ? 'Stupor' : 'Koma';
  const gcsColor = gcsTotal >= 14 ? 'bg-teal-500' : gcsTotal >= 9 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-6">
      <FormField label="Keadaan Umum">
        <RadioGroup
          options={[{ value: 'Baik', label: 'Baik' }, { value: 'Sakit Ringan', label: 'Sakit Ringan' }, { value: 'Sakit Sedang', label: 'Sakit Sedang' }, { value: 'Sakit Berat', label: 'Sakit Berat' }]}
          value={ku}
          onChange={setKu}
        />
      </FormField>

      <div>
        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Glasgow Coma Scale</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <FormField label="Respon Membuka Mata (E)">
              <Select value={gcs.E} onChange={v => setGcs(g => ({ ...g, E: v }))} options={E_OPTIONS} />
            </FormField>
            <FormField label="Respon Verbal/Ucapan (V)">
              <Select value={gcs.V} onChange={v => setGcs(g => ({ ...g, V: v }))} options={V_OPTIONS} />
            </FormField>
            <FormField label="Gerakan (M)">
              <Select value={gcs.M} onChange={v => setGcs(g => ({ ...g, M: v }))} options={M_OPTIONS} />
            </FormField>
          </div>
          <div className={`${gcsColor} rounded-xl flex flex-col items-center justify-center p-8 text-white`}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Tingkat Kesadaran</p>
            <p className="text-6xl font-extrabold">{gcsTotal}</p>
            <p className="text-lg font-semibold mt-2">{gcsLabel}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nadi">
            <Input value={vitals.nadi} onChange={v => setVitals(f => ({ ...f, nadi: v }))} suffix="bpm" type="number" />
          </FormField>
          <FormField label="Tekanan Darah">
            <div className="flex items-center gap-2">
              <Input value={vitals.sistolik} onChange={v => setVitals(f => ({ ...f, sistolik: v }))} placeholder="120" type="number" />
              <span className="text-gray-400 font-bold text-lg">/</span>
              <Input value={vitals.diastolik} onChange={v => setVitals(f => ({ ...f, diastolik: v }))} placeholder="70" type="number" suffix="mmHg" />
            </div>
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Suhu Badan"><Input value={vitals.suhu} onChange={v => setVitals(f => ({ ...f, suhu: v }))} suffix="°C" type="number" /></FormField>
          <FormField label="Nafas"><Input value={vitals.nafas} onChange={v => setVitals(f => ({ ...f, nafas: v }))} suffix="x/menit" type="number" /></FormField>
          <FormField label="Saturasi Oksigen"><Input value={vitals.spo2} onChange={v => setVitals(f => ({ ...f, spo2: v }))} suffix="%" type="number" /></FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tinggi Badan"><Input value={vitals.tinggi} onChange={v => setVitals(f => ({ ...f, tinggi: v }))} suffix="cm" type="number" /></FormField>
          <FormField label="Berat Badan"><Input value={vitals.berat} onChange={v => setVitals(f => ({ ...f, berat: v }))} suffix="kg" type="number" /></FormField>
        </div>
      </div>
      <SaveBtn />
    </div>
  );
});

export default TTV;