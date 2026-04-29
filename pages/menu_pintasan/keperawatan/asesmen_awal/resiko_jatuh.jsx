import React, { useState, useEffect } from 'react';

const AsesmenResikoJatuh = ({ patient, data, onDataChange }) => {
  // Hitung umur dari tanggal lahir
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const patientAge = calculateAge(patient?.pasien?.birth_date || patient?.birth_date);
  const isChild = patientAge !== null && patientAge <= 18;
  const isElderly = patientAge !== null && patientAge >= 60;

  // Data diterima dari parent, bukan state internal
  const resikoJatuhData = data || {};
  
  // State untuk Humpty Dumpty Fall Scale (Anak ≤ 18 tahun)
  const [humptyDumpty, setHumptyDumpty] = useState(
    resikoJatuhData.humptyDumpty || {
      umur: { value: 0, label: '< 3 tahun' },
      jenisKelamin: { value: 0, label: '' },
      diagnosis: { value: 0, label: '' },
      gangguanKognitif: { value: 0, label: '' },
      faktorLingkungan: { value: 0, label: '' },
      sedasi: { value: 0, label: '' }
    }
  );

  // State untuk Hendrich II Fall Risk Model (Lansia ≥ 60 tahun)
  const [hendrich, setHendrich] = useState(
    resikoJatuhData.hendrich || {
      delirium: { value: 0, label: 'Tidak' },
      depresi: { value: 0, label: 'Tidak' },
      inkontinensia: { value: 0, label: 'Tidak' },
      pusingVertigo: { value: 0, label: 'Tidak' },
      jenisKelamin: { value: 0, label: 'Laki-laki' },
      antiepilepsi: { value: 0, label: 'Tidak' },
      benzodiazepin: { value: 0, label: 'Tidak' },
      getUpAndGo: { value: 0, label: 'Normal' }
    }
  );

  // State untuk Morse Fall Scale (Dewasa 19-59 tahun)
  const [morse, setMorse] = useState(
    resikoJatuhData.morse || {
      riwayatJatuh: { value: 0, label: 'Tidak' },
      diagnosisSekunder: { value: 0, label: 'Tidak' },
      alatBantu: { value: 0, label: 'Tidak ada / tirah baring / perawat membantu' },
      terapiIV: { value: 0, label: 'Tidak' },
      gayaBerjalan: { value: 0, label: 'Normal / tirah baring / kursi roda' },
      statusMental: { value: 0, label: 'Orientasi baik / mampu mengingat' }
    }
  );

  // Update parent ketika ada perubahan data
  useEffect(() => {
    if (onDataChange) {
      const allData = {
        humptyDumpty: isChild ? humptyDumpty : null,
        hendrich: isElderly ? hendrich : null,
        morse: (!isChild && !isElderly) ? morse : null,
        jenis_skala: isChild ? 'humpty_dumpty' : (isElderly ? 'hendrich_ii' : 'morse')
      };
      onDataChange(allData);
    }
  }, [humptyDumpty, hendrich, morse, isChild, isElderly]);

  // ========== Options untuk Humpty Dumpty (Anak) ==========
  const umurOptions = [
    { value: 4, label: '< 3 tahun' },
    { value: 3, label: '3-7 tahun' },
    { value: 2, label: '7-13 tahun' },
    { value: 1, label: '13-18 tahun' }
  ];

  const jenisKelaminOptions = [
    { value: 2, label: 'Laki-Laki' },
    { value: 1, label: 'Perempuan' }
  ];

  const diagnosisOptions = [
    { value: 4, label: 'Kelainan Neurologi' },
    { value: 3, label: 'Gangguan Oksigenasi (gangguan pernapasan, dehidrasi, anemia, anoreksia, sinkop, sakit kepala, dll)' },
    { value: 2, label: 'Kelemahan Fisik/Kelainan Psikis' },
    { value: 1, label: 'Ada Diagnosis Tambahan' },
    { value: 0, label: 'Tidak Ada' }
  ];

  const gangguanKognitifOptions = [
    { value: 3, label: 'Tidak Memahami Keterbatasan' },
    { value: 2, label: 'Lupa Keterbatasan' },
    { value: 1, label: 'Orientasi Terhadap Kelemahan' },
    { value: 0, label: 'Tidak Ada' }
  ];

  const faktorLingkunganOptions = [
    { value: 4, label: 'Riwayat Jatuh Dari Tempat Tidur' },
    { value: 3, label: 'Pasien Menggunakan Alat Bantu' },
    { value: 2, label: 'Ruang Terang, Lantai Licin' },
    { value: 1, label: 'Ruang Kurang Terang' },
    { value: 0, label: 'Lingkungan Aman' }
  ];

  const sedasiOptions = [
    { value: 3, label: 'Menggunakan Sedasi / Agitasi' },
    { value: 2, label: 'Pasca Sedasi' },
    { value: 1, label: 'Mengganggu / Gelisah' },
    { value: 0, label: 'Tidak Ada / Responsif' }
  ];

  // ========== Options untuk Hendrich II (Lansia ≥ 60 tahun) ==========
  const deliriumOptions = [
    { value: 4, label: 'Ya (perubahan kesadaran akut / fluktuatif)' },
    { value: 0, label: 'Tidak' }
  ];

  const depresiOptions = [
    { value: 2, label: 'Ya' },
    { value: 0, label: 'Tidak' }
  ];

  const inkontinensiaOptions = [
    { value: 2, label: 'Ya (inkontinensia urine/feses)' },
    { value: 0, label: 'Tidak' }
  ];

  const pusingVertigoOptions = [
    { value: 1, label: 'Ya' },
    { value: 0, label: 'Tidak' }
  ];

  const jenisKelaminHendrichOptions = [
    { value: 1, label: 'Laki-laki' },
    { value: 0, label: 'Perempuan' }
  ];

  const antiepilepsiOptions = [
    { value: 2, label: 'Ya' },
    { value: 0, label: 'Tidak' }
  ];

  const benzodiazepinOptions = [
    { value: 1, label: 'Ya' },
    { value: 0, label: 'Tidak' }
  ];

  const getUpAndGoOptions = [
    { value: 4, label: 'Lemah / Tidak mampu berdiri tanpa bantuan' },
    { value: 1, label: 'Mampu berdiri tapi goyah / pincang' },
    { value: 0, label: 'Normal' }
  ];

  // ========== Options untuk Morse (Dewasa 19-59 tahun) ==========
  const riwayatJatuhOptions = [
    { value: 25, label: 'Ya' },
    { value: 0, label: 'Tidak' }
  ];

  const diagnosisSekunderOptions = [
    { value: 15, label: 'Ya' },
    { value: 0, label: 'Tidak' }
  ];

  const alatBantuOptions = [
    { value: 30, label: 'Kruk / tongkat / alat bantu jalan' },
    { value: 15, label: 'Kursi roda' },
    { value: 0, label: 'Tidak ada / tirah baring / perawat membantu' }
  ];

  const terapiIVOptions = [
    { value: 20, label: 'Ya (terpasang infus)' },
    { value: 0, label: 'Tidak' }
  ];

  const gayaBerjalanOptions = [
    { value: 20, label: 'Lemah / pincang' },
    { value: 10, label: 'Membungkuk / lemah' },
    { value: 0, label: 'Normal / tirah baring / kursi roda' }
  ];

  const statusMentalOptions = [
    { value: 15, label: 'Orientasi buruk / tidak mampu mengingat' },
    { value: 0, label: 'Orientasi baik / mampu mengingat' }
  ];

  // Hitung total skor
  const humptyTotal = Object.values(humptyDumpty).reduce((sum, item) => sum + item.value, 0);
  const humptyRisk = humptyTotal >= 12 ? 'RESIKO TINGGI' : 'RESIKO RENDAH';
  const humptyColor = humptyTotal >= 12 ? 'bg-red-500' : 'bg-green-500';

  const hendrichTotal = Object.values(hendrich).reduce((sum, item) => sum + item.value, 0);
  const hendrichRisk = hendrichTotal >= 5 ? 'RESIKO TINGGI' : 'RESIKO RENDAH';
  const hendrichColor = hendrichTotal >= 5 ? 'bg-red-500' : 'bg-green-500';

  const morseTotal = Object.values(morse).reduce((sum, item) => sum + item.value, 0);
  const morseRisk = morseTotal >= 45 ? 'RESIKO TINGGI' : morseTotal >= 25 ? 'RESIKO SEDANG' : 'RESIKO RENDAH';
  const morseColor = morseTotal >= 45 ? 'bg-red-500' : morseTotal >= 25 ? 'bg-yellow-500' : 'bg-green-500';

  // Update functions
  const updateHumpty = (category, value, label) => {
    setHumptyDumpty(prev => ({ ...prev, [category]: { value, label } }));
  };

  const updateHendrich = (category, value, label) => {
    setHendrich(prev => ({ ...prev, [category]: { value, label } }));
  };

  const updateMorse = (category, value, label) => {
    setMorse(prev => ({ ...prev, [category]: { value, label } }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Informasi Pasien */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">{patient?.pasien?.name || patient?.nama || '-'}</p>
            <p className="text-xs text-gray-500">
              Umur: {patientAge !== null ? `${patientAge} tahun` : patient?.umur || '-'} | 
              Jenis Kelamin: {patient?.pasien?.gender === 'male' ? 'Laki-laki' : patient?.pasien?.gender === 'female' ? 'Perempuan' : '-'}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isChild ? 'bg-teal-100 text-teal-700' : isElderly ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isChild ? 'Humpty Dumpty (Anak ≤ 18 tahun)' : isElderly ? 'Hendrich II (Lansia ≥ 60 tahun)' : 'Morse Fall Scale (Dewasa 19-59 tahun)'}
          </div>
        </div>
      </div>

      {/* Humpty Dumpty Fall Scale (Anak ≤ 18 tahun) */}
      {isChild && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-4 py-3 border-b">
            <h3 className="text-sm font-bold text-teal-800">Skala Resiko Humpty Dumpty (Anak ≤ 18 tahun)</h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {/* Umur */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Umur</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  {umurOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="umur" value={opt.value} checked={humptyDumpty.umur.value === opt.value}
                        onChange={() => updateHumpty('umur', opt.value, opt.label)} className="w-4 h-4 accent-teal-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-teal-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-2">
                  {jenisKelaminOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="jenisKelamin" value={opt.value} checked={humptyDumpty.jenisKelamin.value === opt.value}
                        onChange={() => updateHumpty('jenisKelamin', opt.value, opt.label)} className="w-4 h-4 accent-teal-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-teal-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis</label>
                <div className="space-y-2">
                  {diagnosisOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="diagnosis" value={opt.value} checked={humptyDumpty.diagnosis.value === opt.value}
                        onChange={() => updateHumpty('diagnosis', opt.value, opt.label)} className="w-4 h-4 accent-teal-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-teal-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gangguan Kognitif */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gangguan Kognitif</label>
                <div className="space-y-2">
                  {gangguanKognitifOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="gangguanKognitif" value={opt.value} checked={humptyDumpty.gangguanKognitif.value === opt.value}
                        onChange={() => updateHumpty('gangguanKognitif', opt.value, opt.label)} className="w-4 h-4 accent-teal-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-teal-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Faktor Lingkungan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Faktor Lingkungan</label>
                <div className="space-y-2">
                  {faktorLingkunganOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="faktorLingkungan" value={opt.value} checked={humptyDumpty.faktorLingkungan.value === opt.value}
                        onChange={() => updateHumpty('faktorLingkungan', opt.value, opt.label)} className="w-4 h-4 accent-teal-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-teal-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sedasi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sedasi / Agitasi</label>
                <div className="space-y-2">
                  {sedasiOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="sedasi" value={opt.value} checked={humptyDumpty.sedasi.value === opt.value}
                        onChange={() => updateHumpty('sedasi', opt.value, opt.label)} className="w-4 h-4 accent-teal-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-teal-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className={`${humptyColor} rounded-xl p-4 text-white text-center`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">TOTAL SKOR</p>
                <p className="text-5xl font-extrabold">{humptyTotal}</p>
                <p className="text-lg font-semibold mt-1">{humptyRisk}</p>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">* Skor ≥ 12 = Resiko Tinggi, Skor &lt; 12 = Resiko Rendah</p>
            </div>
          </div>
        </div>
      )}

      {/* Hendrich II Fall Risk Model (Lansia ≥ 60 tahun) */}
      {!isChild && isElderly && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b">
            <h3 className="text-sm font-bold text-purple-800">Hendrich II Fall Risk Model (Lansia ≥ 60 tahun)</h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {/* Delirium */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Delirium</label>
                <div className="grid grid-cols-2 gap-2">
                  {deliriumOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="delirium" value={opt.value} checked={hendrich.delirium.value === opt.value}
                        onChange={() => updateHendrich('delirium', opt.value, opt.label)} className="w-4 h-4 accent-purple-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-purple-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Depresi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Depresi</label>
                <div className="grid grid-cols-2 gap-2">
                  {depresiOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="depresi" value={opt.value} checked={hendrich.depresi.value === opt.value}
                        onChange={() => updateHendrich('depresi', opt.value, opt.label)} className="w-4 h-4 accent-purple-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-purple-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Inkontinensia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Inkontinensia</label>
                <div className="grid grid-cols-2 gap-2">
                  {inkontinensiaOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="inkontinensia" value={opt.value} checked={hendrich.inkontinensia.value === opt.value}
                        onChange={() => updateHendrich('inkontinensia', opt.value, opt.label)} className="w-4 h-4 accent-purple-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-purple-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pusing / Vertigo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pusing / Vertigo</label>
                <div className="grid grid-cols-2 gap-2">
                  {pusingVertigoOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="pusingVertigo" value={opt.value} checked={hendrich.pusingVertigo.value === opt.value}
                        onChange={() => updateHendrich('pusingVertigo', opt.value, opt.label)} className="w-4 h-4 accent-purple-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-purple-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-2">
                  {jenisKelaminHendrichOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="jenisKelaminH" value={opt.value} checked={hendrich.jenisKelamin.value === opt.value}
                        onChange={() => updateHendrich('jenisKelamin', opt.value, opt.label)} className="w-4 h-4 accent-purple-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-purple-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Antiepilepsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Antiepilepsi</label>
                <div className="grid grid-cols-2 gap-2">
                  {antiepilepsiOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="antiepilepsi" value={opt.value} checked={hendrich.antiepilepsi.value === opt.value}
                        onChange={() => updateHendrich('antiepilepsi', opt.value, opt.label)} className="w-4 h-4 accent-purple-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-purple-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Benzodiazepin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Benzodiazepin</label>
                <div className="grid grid-cols-2 gap-2">
                  {benzodiazepinOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="benzodiazepin" value={opt.value} checked={hendrich.benzodiazepin.value === opt.value}
                        onChange={() => updateHendrich('benzodiazepin', opt.value, opt.label)} className="w-4 h-4 accent-purple-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-purple-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Get Up and Go Test */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Get Up and Go Test</label>
                <div className="space-y-2">
                  {getUpAndGoOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="getUpAndGo" value={opt.value} checked={hendrich.getUpAndGo.value === opt.value}
                        onChange={() => updateHendrich('getUpAndGo', opt.value, opt.label)} className="w-4 h-4 accent-purple-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-purple-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className={`${hendrichColor} rounded-xl p-4 text-white text-center`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">TOTAL SKOR</p>
                <p className="text-5xl font-extrabold">{hendrichTotal}</p>
                <p className="text-lg font-semibold mt-1">{hendrichRisk}</p>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                * Skor ≥ 5 = Resiko Tinggi Jatuh, Skor &lt; 5 = Resiko Rendah Jatuh
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Morse Fall Scale (Dewasa 19-59 tahun) */}
      {!isChild && !isElderly && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
            <h3 className="text-sm font-bold text-blue-800">Morse Fall Scale (Dewasa 19-59 tahun)</h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {/* Riwayat Jatuh */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Riwayat Jatuh</label>
                <div className="grid grid-cols-2 gap-2">
                  {riwayatJatuhOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="riwayatJatuh" value={opt.value} checked={morse.riwayatJatuh.value === opt.value}
                        onChange={() => updateMorse('riwayatJatuh', opt.value, opt.label)} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-blue-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Diagnosis Sekunder */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis Sekunder</label>
                <div className="grid grid-cols-2 gap-2">
                  {diagnosisSekunderOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="diagnosisSekunder" value={opt.value} checked={morse.diagnosisSekunder.value === opt.value}
                        onChange={() => updateMorse('diagnosisSekunder', opt.value, opt.label)} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-blue-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Alat Bantu */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alat Bantu Jalan</label>
                <div className="space-y-2">
                  {alatBantuOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="alatBantu" value={opt.value} checked={morse.alatBantu.value === opt.value}
                        onChange={() => updateMorse('alatBantu', opt.value, opt.label)} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-blue-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Terapi IV */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Terapi Intravena</label>
                <div className="grid grid-cols-2 gap-2">
                  {terapiIVOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="terapiIV" value={opt.value} checked={morse.terapiIV.value === opt.value}
                        onChange={() => updateMorse('terapiIV', opt.value, opt.label)} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-blue-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gaya Berjalan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gaya Berjalan</label>
                <div className="space-y-2">
                  {gayaBerjalanOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="gayaBerjalan" value={opt.value} checked={morse.gayaBerjalan.value === opt.value}
                        onChange={() => updateMorse('gayaBerjalan', opt.value, opt.label)} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-blue-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Mental */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Mental</label>
                <div className="space-y-2">
                  {statusMentalOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="statusMental" value={opt.value} checked={morse.statusMental.value === opt.value}
                        onChange={() => updateMorse('statusMental', opt.value, opt.label)} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <span className="ml-auto text-xs font-bold text-blue-600">({opt.value})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className={`${morseColor} rounded-xl p-4 text-white text-center`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">TOTAL SKOR</p>
                <p className="text-5xl font-extrabold">{morseTotal}</p>
                <p className="text-lg font-semibold mt-1">{morseRisk}</p>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                * Skor ≥ 45 = Resiko Tinggi, 25-44 = Resiko Sedang, 0-24 = Resiko Rendah
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsesmenResikoJatuh;