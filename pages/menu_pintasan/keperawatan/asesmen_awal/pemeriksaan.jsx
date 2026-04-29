import React from 'react';

const Pemeriksaan = ({ patient, data, onDataChange }) => {
  // Data diterima dari parent, bukan state internal
  const {
    gcs = { e: '4', v: '5', m: '6' },
    ttv = {
      nadi: '',
      suhu: '',
      nafas: '',
      sistolik: '',
      diastolik: '',
      spo2: '',
      beratBadan: '',
      tinggiBadan: ''
    },
    pemeriksaanFisik = {
      kepala: 'normal', mata: 'normal', hidung: 'normal', telinga: 'normal',
      mulut: 'normal', leher: 'normal', thoraks: 'normal', jantung: 'normal',
      paru: 'normal', abdomen: 'normal', ekstremitasAtas: 'normal',
      ekstremitasBawah: 'normal', kulit: 'normal', genetalia: 'normal', neurologis: 'normal'
    },
    catatanFisik = {}
  } = data || {};

  // Hitung GCS total
  const gcsTotal = (parseInt(gcs.e) || 0) + (parseInt(gcs.v) || 0) + (parseInt(gcs.m) || 0);
  
  const getGcsLabel = () => {
    if (gcsTotal >= 14) return 'Compos Mentis';
    if (gcsTotal >= 9) return 'Somnolen';
    if (gcsTotal >= 6) return 'Stupor';
    return 'Koma';
  };

  const getGcsColor = () => {
    if (gcsTotal >= 14) return 'bg-teal-500';
    if (gcsTotal >= 9) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Fungsi update yang memanggil onDataChange dari parent
  const updateField = (field, value) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
  };

  const updateGcs = (field, value) => {
    updateField('gcs', { ...gcs, [field]: value });
  };

  const updateTtv = (field, value) => {
    updateField('ttv', { ...ttv, [field]: value });
  };

  const updatePemeriksaanFisik = (organ, value) => {
    updateField('pemeriksaanFisik', { ...pemeriksaanFisik, [organ]: value });
  };

  const updateCatatanFisik = (organ, value) => {
    updateField('catatanFisik', { ...catatanFisik, [organ]: value });
  };

  const gcsEOptions = [
    { value: '4', label: '[4] Mata terbuka secara spontan terhadap rangsangan apapun' },
    { value: '3', label: '[3] Membuka mata terhadap suara' },
    { value: '2', label: '[2] Membuka mata terhadap nyeri' },
    { value: '1', label: '[1] Tidak ada respons' }
  ];

  const gcsVOptions = [
    { value: '5', label: '[5] Menjawab dengan baik' },
    { value: '4', label: '[4] Bingung' },
    { value: '3', label: '[3] Kata-kata tidak tepat' },
    { value: '2', label: '[2] Suara tidak dimengerti' },
    { value: '1', label: '[1] Tidak ada respons' }
  ];

  const gcsMOptions = [
    { value: '6', label: '[6] Melakukan gerakan yang diminta' },
    { value: '5', label: '[5] Menunjuk tempat rangsangan nyeri' },
    { value: '4', label: '[4] Menghindari rangsangan nyeri' },
    { value: '3', label: '[3] Fleksi abnormal' },
    { value: '2', label: '[2] Ekstensi abnormal' },
    { value: '1', label: '[1] Tidak ada respons' }
  ];

  const organList = [
    { id: 'kepala', label: 'Kepala' },
    { id: 'mata', label: 'Mata' },
    { id: 'hidung', label: 'Hidung' },
    { id: 'telinga', label: 'Telinga' },
    { id: 'mulut', label: 'Mulut & Gigi' },
    { id: 'leher', label: 'Leher' },
    { id: 'thoraks', label: 'Thoraks' },
    { id: 'jantung', label: 'Jantung' },
    { id: 'paru', label: 'Paru' },
    { id: 'abdomen', label: 'Abdomen' },
    { id: 'ekstremitasAtas', label: 'Ekstremitas Atas' },
    { id: 'ekstremitasBawah', label: 'Ekstremitas Bawah' },
    { id: 'kulit', label: 'Kulit' },
    { id: 'genetalia', label: 'Genetalia' },
    { id: 'neurologis', label: 'Neurologis' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* GLASGOW COMA SCALE */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-sm font-bold text-gray-800">GLASGOW COMA SCALE</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Respon Membuka Mata (E)
              </label>
              <select
                value={gcs.e}
                onChange={(e) => updateGcs('e', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {gcsEOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Respon Verbal/Ucapan (V)
              </label>
              <select
                value={gcs.v}
                onChange={(e) => updateGcs('v', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {gcsVOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gerakan (M)
              </label>
              <select
                value={gcs.m}
                onChange={(e) => updateGcs('m', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {gcsMOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tingkat Kesadaran */}
          <div className={`mt-6 ${getGcsColor()} rounded-xl p-4 text-white text-center`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Tingkat Kesadaran</p>
            <p className="text-5xl font-extrabold">{gcsTotal}</p>
            <p className="text-lg font-semibold mt-1">{getGcsLabel()}</p>
          </div>
        </div>
      </div>

      {/* TANDA-TANDA VITAL */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-sm font-bold text-gray-800">TANDA-TANDA VITAL</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Nadi */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nadi</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={ttv.nadi}
                  onChange={(e) => updateTtv('nadi', e.target.value)}
                  placeholder="75"
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
                <span className="px-2 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500">bpm</span>
              </div>
            </div>

            {/* Suhu Badan */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Suhu Badan</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="number"
                  step="0.1"
                  value={ttv.suhu}
                  onChange={(e) => updateTtv('suhu', e.target.value)}
                  placeholder="36.5"
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
                <span className="px-2 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500">°C</span>
              </div>
            </div>

            {/* Nafas */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nafas</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={ttv.nafas}
                  onChange={(e) => updateTtv('nafas', e.target.value)}
                  placeholder="18"
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
                <span className="px-2 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500">x/menit</span>
              </div>
            </div>

            {/* Saturasi Oksigen */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Saturasi Oksigen</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={ttv.spo2}
                  onChange={(e) => updateTtv('spo2', e.target.value)}
                  placeholder="98"
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
                <span className="px-2 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500">%</span>
              </div>
            </div>

            {/* Tekanan Darah */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tekanan Darah</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    value={ttv.sistolik}
                    onChange={(e) => updateTtv('sistolik', e.target.value)}
                    placeholder="120"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                  <span className="px-2 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500">Sistolik</span>
                </div>
                <span className="text-gray-400 font-bold">/</span>
                <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    value={ttv.diastolik}
                    onChange={(e) => updateTtv('diastolik', e.target.value)}
                    placeholder="80"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                  <span className="px-2 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500">Diastolik</span>
                </div>
                <span className="text-xs text-gray-500">mmHg</span>
              </div>
            </div>

            {/* Berat Badan */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Berat Badan</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="number"
                  step="0.1"
                  value={ttv.beratBadan}
                  onChange={(e) => updateTtv('beratBadan', e.target.value)}
                  placeholder="70.5"
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
                <span className="px-2 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500">kg</span>
              </div>
            </div>

            {/* Tinggi Badan */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tinggi Badan</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="number"
                  step="0.1"
                  value={ttv.tinggiBadan}
                  onChange={(e) => updateTtv('tinggiBadan', e.target.value)}
                  placeholder="165"
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
                <span className="px-2 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500">cm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PEMERIKSAAN FISIK */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-sm font-bold text-gray-800">PEMERIKSAAN FISIK</h3>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Organ/Sistem</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Normal</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Abnormal</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {organList.map(organ => (
                  <tr key={organ.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-700">{organ.label}</td>
                    <td className="px-3 py-2">
                      <input
                        type="radio"
                        name={`organ_${organ.id}`}
                        checked={pemeriksaanFisik[organ.id] === 'normal'}
                        onChange={() => updatePemeriksaanFisik(organ.id, 'normal')}
                        className="w-4 h-4 accent-teal-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="radio"
                        name={`organ_${organ.id}`}
                        checked={pemeriksaanFisik[organ.id] === 'abnormal'}
                        onChange={() => updatePemeriksaanFisik(organ.id, 'abnormal')}
                        className="w-4 h-4 accent-red-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={catatanFisik[organ.id] || ''}
                        onChange={(e) => updateCatatanFisik(organ.id, e.target.value)}
                        placeholder={pemeriksaanFisik[organ.id] === 'abnormal' ? 'Keterangan...' : ''}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                        disabled={pemeriksaanFisik[organ.id] !== 'abnormal'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pemeriksaan;