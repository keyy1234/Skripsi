import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrasiPasien = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('identitas');

  // State untuk data pasien dengan DEFAULT VALUES
  const [formData, setFormData] = useState({
    // Identitas
    nik: '1234567890123456',
    bpjsNumber: '1234567890123',
    name: 'Ahmad Rizki Ramadhan',
    familyName: 'Ramadhan',
    givenName: 'Ahmad Rizki',
    prefix: 'dr.',
    suffix: 'Sp.PD',
    gender: 'male',
    birthDate: '1995-05-15',
    maritalStatusCode: 'M',
    maritalStatusDisplay: 'Married / Kawin',
    multipleBirthBoolean: false,
    
    // Kontak
    phone: '081234567890',
    email: 'ahmad.rizki@example.com',
    addressLine: 'Jl. Sudirman No. 123, RT 05 RW 03',
    addressCity: 'Jakarta Selatan',
    addressPostalCode: '12950',
    addressCountry: 'ID',
    provinceCode: '31',
    cityCode: '3171',
    districtCode: '3171010',
    villageCode: '3171010001',
    rt: '05',
    rw: '03',
    
    // Penjamin / Keluarga
    contactName: 'Siti Aisyah',
    contactRelationship: 'Istri',
    contactPhone: '081234567891',
    contactGender: 'female',
    contactAddress: 'Jl. Sudirman No. 123, RT 05 RW 03',
    
    // Bahasa
    languageCode: 'id-ID',
    languageDisplay: 'Indonesian'
  });

  const genderOptions = [
    { value: 'male', label: 'Laki-laki' },
    { value: 'female', label: 'Perempuan' },
    { value: 'other', label: 'Lainnya' },
    { value: 'unknown', label: 'Tidak diketahui' }
  ];

  const maritalStatusOptions = [
    { code: 'M', display: 'Married / Kawin' },
    { code: 'S', display: 'Single / Belum Kawin' },
    { code: 'D', display: 'Divorced / Cerai' },
    { code: 'W', display: 'Widowed / Janda/Duda' }
  ];

  const relationshipOptions = [
    { code: 'C', display: 'Emergency Contact / Keluarga' },
    { code: 'N', display: 'Next of Kin / Saudara' },
    { code: 'F', display: 'Father / Ayah' },
    { code: 'M', display: 'Mother / Ibu' },
    { code: 'S', display: 'Spouse / Suami/Istri' },
    { code: 'O', display: 'Other / Lainnya' }
  ];

  const languageOptions = [
    { code: 'id-ID', display: 'Indonesian' },
    { code: 'en-US', display: 'English' },
    { code: 'ja-JP', display: 'Japanese' },
    { code: 'zh-CN', display: 'Chinese' }
  ];

  const API_URL = 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const resetForm = () => {
    setFormData({
      nik: '1234567890123456',
      bpjsNumber: '1234567890123',
      name: 'Ahmad Rizki Ramadhan',
      familyName: 'Ramadhan',
      givenName: 'Ahmad Rizki',
      prefix: 'dr.',
      suffix: 'Sp.PD',
      gender: 'male',
      birthDate: '1995-05-15',
      maritalStatusCode: 'M',
      maritalStatusDisplay: 'Married / Kawin',
      multipleBirthBoolean: false,
      phone: '081234567890',
      email: 'ahmad.rizki@example.com',
      addressLine: 'Jl. Sudirman No. 123, RT 05 RW 03',
      addressCity: 'Jakarta Selatan',
      addressPostalCode: '12950',
      addressCountry: 'ID',
      provinceCode: '31',
      cityCode: '3171',
      districtCode: '3171010',
      villageCode: '3171010001',
      rt: '05',
      rw: '03',
      contactName: 'Siti Aisyah',
      contactRelationship: 'Istri',
      contactPhone: '081234567891',
      contactGender: 'female',
      contactAddress: 'Jl. Sudirman No. 123, RT 05 RW 03',
      languageCode: 'id-ID',
      languageDisplay: 'Indonesian'
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validasi required fields
    if (!formData.name) {
      setError('Nama lengkap wajib diisi');
      setIsLoading(false);
      return;
    }

    if (!formData.gender) {
      setError('Jenis kelamin wajib dipilih');
      setIsLoading(false);
      return;
    }

    if (!formData.birthDate) {
      setError('Tanggal lahir wajib diisi');
      setIsLoading(false);
      return;
    }

    try {
      // Validasi NIK (16 digit)
      if (formData.nik && formData.nik.length !== 16) {
        throw new Error('NIK harus 16 digit angka');
      }

      // Validasi BPJS (13 digit)
      if (formData.bpjsNumber && formData.bpjsNumber.length !== 13) {
        throw new Error('Nomor BPJS harus 13 digit angka');
      }

      // Validasi email format
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Format email tidak valid');
      }

      // Data yang akan dikirim ke BACKEND
      const patientData = {
        nik: formData.nik || null,
        bpjsNumber: formData.bpjsNumber || null,
        name: formData.name,
        familyName: formData.familyName || null,
        givenName: formData.givenName || null,
        prefix: formData.prefix || null,
        suffix: formData.suffix || null,
        gender: formData.gender,
        birthDate: formData.birthDate,
        maritalStatusCode: formData.maritalStatusCode || null,
        maritalStatusDisplay: formData.maritalStatusDisplay || null,
        multipleBirthBoolean: formData.multipleBirthBoolean,
        phone: formData.phone || null,
        email: formData.email || null,
        addressLine: formData.addressLine || null,
        addressCity: formData.addressCity || null,
        addressPostalCode: formData.addressPostalCode || null,
        addressCountry: formData.addressCountry || 'ID',
        provinceCode: formData.provinceCode || null,
        cityCode: formData.cityCode || null,
        districtCode: formData.districtCode || null,
        villageCode: formData.villageCode || null,
        rt: formData.rt || null,
        rw: formData.rw || null,
        contactName: formData.contactName || null,
        contactRelationship: formData.contactRelationship || null,
        contactPhone: formData.contactPhone || null,
        contactGender: formData.contactGender || null,
        contactAddress: formData.contactAddress || null,
        languageCode: formData.languageCode,
        languageDisplay: formData.languageDisplay
      };

      console.log('Menyimpan data pasien ke backend:', patientData);

      // Ambil token dari localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
      }

      // KIRIM KE BACKEND
      const response = await fetch(`${API_URL}/api/pasien`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('Data berhasil disimpan:', result.data);
        setSuccess('Registrasi pasien berhasil!');
        
        setTimeout(() => {
          navigate('/pasien');
        }, 2000);
      } else {
        throw new Error(result.message);
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Registrasi Pasien Baru</h1>
            <p className="text-gray-600">Isi data pasien sesuai format standar kesehatan</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
            title="Reset ke data default"
          >
            Reset Default
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('identitas')}
            className={`px-4 py-2 font-medium ${activeTab === 'identitas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Identitas Pasien
          </button>
          <button
            onClick={() => setActiveTab('kontak')}
            className={`px-4 py-2 font-medium ${activeTab === 'kontak' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Kontak & Alamat
          </button>
          <button
            onClick={() => setActiveTab('penjamin')}
            className={`px-4 py-2 font-medium ${activeTab === 'penjamin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Penjamin / Keluarga
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Tab Identitas Pasien */}
            {activeTab === 'identitas' && (
              <div className="space-y-6">
                {/* NIK & BPJS */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Identitas Resmi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIK (Nomor Induk Kependudukan)
                      </label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={handleChange}
                        placeholder="16 digit nomor NIK"
                        maxLength="16"
                        pattern="[0-9]*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">16 digit angka</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor BPJS Kesehatan
                      </label>
                      <input
                        type="text"
                        name="bpjsNumber"
                        value={formData.bpjsNumber}
                        onChange={handleChange}
                        placeholder="13 digit nomor BPJS"
                        maxLength="13"
                        pattern="[0-9]*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">13 digit angka</p>
                    </div>
                  </div>
                </div>

                {/* Nama Pasien */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Nama Pasien</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nama lengkap pasien"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Belakang (Family)
                      </label>
                      <input
                        type="text"
                        name="familyName"
                        value={formData.familyName}
                        onChange={handleChange}
                        placeholder="Nama belakang"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Depan / Tengah (Given)
                      </label>
                      <input
                        type="text"
                        name="givenName"
                        value={formData.givenName}
                        onChange={handleChange}
                        placeholder="Nama depan atau tengah"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gelar Depan (Prefix)
                      </label>
                      <input
                        type="text"
                        name="prefix"
                        value={formData.prefix}
                        onChange={handleChange}
                        placeholder="Contoh: Dr., Prof., H."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gelar Belakang (Suffix)
                      </label>
                      <input
                        type="text"
                        name="suffix"
                        value={formData.suffix}
                        onChange={handleChange}
                        placeholder="Contoh: S.Kom, M.Kes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Informasi Dasar */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Informasi Dasar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={handleChange}
                        name="gender"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        {genderOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Lahir <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status Perkawinan
                      </label>
                      <select
                        value={formData.maritalStatusCode}
                        onChange={(e) => {
                          const selected = maritalStatusOptions.find(opt => opt.code === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            maritalStatusCode: selected?.code || '',
                            maritalStatusDisplay: selected?.display || ''
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Pilih Status</option>
                        {maritalStatusOptions.map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.display}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kelahiran Kembar
                      </label>
                      <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={formData.multipleBirthBoolean === false}
                            onChange={() => setFormData(prev => ({ ...prev, multipleBirthBoolean: false }))}
                          />
                          <span>Tidak</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={formData.multipleBirthBoolean === true}
                            onChange={() => setFormData(prev => ({ ...prev, multipleBirthBoolean: true }))}
                          />
                          <span>Ya</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Kontak & Alamat */}
            {activeTab === 'kontak' && (
              <div className="space-y-6">
                {/* Kontak */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Kontak</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor HP / WhatsApp
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="08123456789"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Alamat */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Alamat</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Lengkap
                      </label>
                      <textarea
                        name="addressLine"
                        value={formData.addressLine}
                        onChange={handleChange}
                        placeholder="Jalan, Blok, Nomor Rumah"
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                        <input
                          type="text"
                          name="addressCity"
                          value={formData.addressCity}
                          onChange={handleChange}
                          placeholder="Kota"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                        <input
                          type="text"
                          name="addressPostalCode"
                          value={formData.addressPostalCode}
                          onChange={handleChange}
                          placeholder="Kode Pos"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Negara</label>
                        <input
                          type="text"
                          name="addressCountry"
                          value={formData.addressCountry}
                          onChange={handleChange}
                          placeholder="ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Kode Administratif */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Kode Administratif</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Provinsi</label>
                          <input
                            type="text"
                            name="provinceCode"
                            value={formData.provinceCode}
                            onChange={handleChange}
                            placeholder="Kode provinsi"
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Kota/Kabupaten</label>
                          <input
                            type="text"
                            name="cityCode"
                            value={formData.cityCode}
                            onChange={handleChange}
                            placeholder="Kode kota"
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Kecamatan</label>
                          <input
                            type="text"
                            name="districtCode"
                            value={formData.districtCode}
                            onChange={handleChange}
                            placeholder="Kode kecamatan"
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Kelurahan</label>
                          <input
                            type="text"
                            name="villageCode"
                            value={formData.villageCode}
                            onChange={handleChange}
                            placeholder="Kode kelurahan"
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">RT</label>
                          <input
                            type="text"
                            name="rt"
                            value={formData.rt}
                            onChange={handleChange}
                            placeholder="RT"
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">RW</label>
                          <input
                            type="text"
                            name="rw"
                            value={formData.rw}
                            onChange={handleChange}
                            placeholder="RW"
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bahasa */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Bahasa Komunikasi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bahasa
                      </label>
                      <select
                        value={formData.languageCode}
                        onChange={(e) => {
                          const selected = languageOptions.find(opt => opt.code === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            languageCode: selected?.code || 'id-ID',
                            languageDisplay: selected?.display || 'Indonesian'
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {languageOptions.map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.display}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Penjamin / Keluarga */}
            {activeTab === 'penjamin' && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Penjamin / Keluarga</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hubungan dengan Pasien
                    </label>
                    <select
                      value={formData.contactRelationship}
                      onChange={(e) => {
                        const selected = relationshipOptions.find(opt => opt.code === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          contactRelationship: selected?.display || ''
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Pilih Hubungan</option>
                      {relationshipOptions.map(opt => (
                        <option key={opt.code} value={opt.code}>{opt.display}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Penjamin / Keluarga
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Nama lengkap penjamin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor HP Penjamin
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="Nomor telepon"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin Penjamin
                      </label>
                      <select
                        name="contactGender"
                        value={formData.contactGender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Pilih</option>
                        {genderOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat Penjamin (jika berbeda)
                    </label>
                    <textarea
                      name="contactAddress"
                      value={formData.contactAddress}
                      onChange={handleChange}
                      placeholder="Alamat penjamin"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error & Success Messages */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate('/pasien')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <div className="flex gap-3">
                {activeTab !== 'identitas' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'kontak' ? 'identitas' : 'kontak')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Sebelumnya
                  </button>
                )}
                {activeTab !== 'penjamin' ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'identitas' ? 'kontak' : 'penjamin')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Selanjutnya
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan Data Pasien'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrasiPasien;