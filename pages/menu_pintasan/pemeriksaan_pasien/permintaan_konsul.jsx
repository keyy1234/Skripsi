import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PermintaanKonsul = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient || null;

  // State untuk form permintaan konsul
  const [selectedSpesialis, setSelectedSpesialis] = useState('');
  const [alasanKonsul, setAlasanKonsul] = useState('');
  const [pertanyaanKlinis, setPertanyaanKlinis] = useState('');
  const [prioritas, setPrioritas] = useState('rutin');
  const [tanggalDiminta, setTanggalDiminta] = useState(new Date().toISOString().slice(0, 16));
  const [catatan, setCatatan] = useState('');

  // State untuk daftar permintaan konsul
  const [daftarKonsul, setDaftarKonsul] = useState([]);

  // Daftar spesialis yang tersedia
  const daftarSpesialis = [
    { id: 1, nama: 'Spesialis Bedah (Sp.B)', ruangan: 'Poliklinik Bedah Lantai 2' },
    { id: 2, nama: 'Spesialis Penyakit Dalam (Sp.PD)', ruangan: 'Poliklinik Penyakit Dalam Lantai 2' },
    { id: 3, nama: 'Spesialis Anak (Sp.A)', ruangan: 'Poliklinik Anak Lantai 1' },
    { id: 4, nama: 'Spesialis Obstetri & Ginekologi (Sp.OG)', ruangan: 'Poliklinik Obgyn Lantai 1' },
    { id: 5, nama: 'Spesialis Jantung (Sp.JP)', ruangan: 'Poliklinik Jantung Lantai 3' },
    { id: 6, nama: 'Spesialis Saraf (Sp.S)', ruangan: 'Poliklinik Saraf Lantai 3' },
    { id: 7, nama: 'Spesialis Jiwa (Sp.KJ)', ruangan: 'Poliklinik Jiwa Lantai 4' },
    { id: 8, nama: 'Spesialis Paru (Sp.P)', ruangan: 'Poliklinik Paru Lantai 2' },
    { id: 9, nama: 'Spesialis Kulit & Kelamin (Sp.KK)', ruangan: 'Poliklinik Kulit Lantai 1' },
    { id: 10, nama: 'Spesialis Mata (Sp.M)', ruangan: 'Poliklinik Mata Lantai 1' },
    { id: 11, nama: 'Spesialis THT (Sp.THT)', ruangan: 'Poliklinik THT Lantai 1' },
    { id: 12, nama: 'Spesialis Rehab Medik (Sp.RM)', ruangan: 'Poliklinik Rehab Lantai 2' },
    { id: 13, nama: 'Spesialis Anestesi (Sp.An)', ruangan: 'Ruang Operasi Lantai 3' },
    { id: 14, nama: 'Spesialis Radiologi (Sp.Rad)', ruangan: 'Radiologi Lantai 1' },
    { id: 15, nama: 'Spesialis Patologi Klinik (Sp.PK)', ruangan: 'Laboratorium Lantai 1' },
  ];

  // Daftar DPJP (Dokter Penanggung Jawab Pasien)
  const daftarDPJP = [
    { id: 1, nama: 'dr. Andi Saputra, Sp.B', spesialis: 'Bedah' },
    { id: 2, nama: 'dr. Budi Santoso, Sp.PD', spesialis: 'Penyakit Dalam' },
    { id: 3, nama: 'dr. Citra Dewi, Sp.OG', spesialis: 'Obgyn' },
    { id: 4, nama: 'dr. Dedi Firmansyah, Sp.A', spesialis: 'Anak' },
  ];

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: 'Menunggu',
      accepted: 'Diterima',
      completed: 'Selesai',
      rejected: 'Ditolak',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Tambah permintaan konsul
  const tambahPermintaan = () => {
    if (!selectedSpesialis) {
      alert('Pilih spesialis tujuan konsul');
      return;
    }
    if (!alasanKonsul.trim()) {
      alert('Alasan konsul harus diisi');
      return;
    }

    const spesialisTerpilih = daftarSpesialis.find(s => s.id.toString() === selectedSpesialis);

    const konsulBaru = {
      id: Date.now(),
      nomor_permintaan: `KONS/${new Date().getFullYear()}/${String(daftarKonsul.length + 1).padStart(4, '0')}`,
      spesialis: spesialisTerpilih,
      alasan: alasanKonsul,
      pertanyaan: pertanyaanKlinis,
      prioritas: prioritas,
      tanggal_diminta: tanggalDiminta,
      catatan: catatan,
      status: 'pending',
      dpjp: daftarDPJP[0]?.nama || 'Dokter',
      hasil_konsul: null,
      waktu_selesai: null,
    };

    setDaftarKonsul([...daftarKonsul, konsulBaru]);

    // Reset form
    setSelectedSpesialis('');
    setAlasanKonsul('');
    setPertanyaanKlinis('');
    setPrioritas('rutin');
    setCatatan('');
  };

  // Update status konsul
  const updateStatus = (id, newStatus, hasil = null) => {
    setDaftarKonsul(prev => prev.map(k => {
      if (k.id === id) {
        return {
          ...k,
          status: newStatus,
          hasil_konsul: hasil || k.hasil_konsul,
          waktu_selesai: newStatus === 'completed' ? new Date().toLocaleString('id-ID') : k.waktu_selesai,
        };
      }
      return k;
    }));
  };

  // Hapus permintaan
  const hapusPermintaan = (id) => {
    setDaftarKonsul(prev => prev.filter(k => k.id !== id));
  };

  // Modal untuk input hasil konsul
  const [modalHasil, setModalHasil] = useState({ open: false, konsulId: null, hasil: '' });

  const openHasilModal = (id) => {
    setModalHasil({ open: true, konsulId: id, hasil: '' });
  };

  const submitHasilKonsul = () => {
    if (modalHasil.hasil.trim()) {
      updateStatus(modalHasil.konsulId, 'completed', modalHasil.hasil);
      setModalHasil({ open: false, konsulId: null, hasil: '' });
    } else {
      alert('Harus diisi hasil konsul');
    }
  };

  // Jika tidak ada data pasien
  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tidak Ada Data Pasien</h2>
          <p className="text-gray-500 mb-6">Silakan pilih pasien terlebih dahulu dari halaman Pelayanan.</p>
          <button
            onClick={() => navigate('/pelayanan')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Kembali ke Pelayanan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">

        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Kolom Kiri: Form Permintaan Konsul */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                Permintaan Konsultasi
              </h3>

              <div className="space-y-4">
                {/* Pilih Spesialis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spesialis Tujuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSpesialis}
                    onChange={(e) => setSelectedSpesialis(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">-- Pilih Spesialis --</option>
                    {daftarSpesialis.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} - {s.ruangan}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alasan Konsul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Konsul <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={alasanKonsul}
                    onChange={(e) => setAlasanKonsul(e.target.value)}
                    placeholder="Contoh: Pasien dengan komplikasi jantung memerlukan evaluasi lebih lanjut..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Pertanyaan Klinis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pertanyaan Klinis
                  </label>
                  <textarea
                    rows={2}
                    value={pertanyaanKlinis}
                    onChange={(e) => setPertanyaanKlinis(e.target.value)}
                    placeholder="Contoh: Apakah perlu dilakukan ekokardiografi? Apakah ada kontraindikasi operasi?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Prioritas & Tanggal */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioritas
                    </label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          value="rutin"
                          checked={prioritas === 'rutin'}
                          onChange={(e) => setPrioritas(e.target.value)}
                          className="text-teal-600"
                        />
                        <span className="text-sm">Rutin</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          value="cito"
                          checked={prioritas === 'cito'}
                          onChange={(e) => setPrioritas(e.target.value)}
                          className="text-red-600"
                        />
                        <span className="text-sm text-red-600">Cito (Segera)</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Diminta
                    </label>
                    <input
                      type="datetime-local"
                      value={tanggalDiminta}
                      onChange={(e) => setTanggalDiminta(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Catatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={1}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Informasi tambahan untuk dokter konsulen..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Tombol Tambah */}
                <button
                  onClick={tambahPermintaan}
                  className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Kirim Permintaan Konsul
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-20">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Statistik Konsul
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-yellow-700">Menunggu</span>
                  <span className="font-bold text-yellow-700">{daftarKonsul.filter(k => k.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">Diterima</span>
                  <span className="font-bold text-blue-700">{daftarKonsul.filter(k => k.status === 'accepted').length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700">Selesai</span>
                  <span className="font-bold text-green-700">{daftarKonsul.filter(k => k.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Total</span>
                  <span className="font-bold text-gray-700">{daftarKonsul.length}</span>
                </div>
              </div>

              {daftarKonsul.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">Belum ada permintaan konsul</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabel Daftar Permintaan Konsul */}
        {daftarKonsul.length > 0 && (
          <div className="mt-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">📋 Daftar Permintaan Konsultasi</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left">No. Permintaan</th>
                    <th className="px-4 py-2 text-left">Spesialis</th>
                    <th className="px-4 py-2 text-left">Alasan</th>
                    <th className="px-4 py-2 text-left">Prioritas</th>
                    <th className="px-4 py-2 text-left">Tanggal</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Hasil Konsul</th>
                    <th className="px-4 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarKonsul.map(k => (
                    <tr key={k.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{k.nomor_permintaan}</td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{k.spesialis?.nama}</div>
                        <div className="text-xs text-gray-400">{k.spesialis?.ruangan}</div>
                      </td>
                      <td className="px-4 py-2 max-w-xs">
                        <p className="truncate">{k.alasan}</p>
                      </td>
                      <td className="px-4 py-2">
                        {k.prioritas === 'cito' ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">CITO</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Rutin</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {new Date(k.tanggal_diminta).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge status={k.status} />
                      </td>
                      <td className="px-4 py-2 max-w-xs">
                        {k.hasil_konsul ? (
                          <p className="text-xs text-gray-600 truncate">{k.hasil_konsul}</p>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {k.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(k.id, 'accepted')}
                                className="p-1 text-blue-500 hover:text-blue-700"
                                title="Terima"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => updateStatus(k.id, 'rejected')}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Tolak"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                          {k.status === 'accepted' && (
                            <button
                              onClick={() => openHasilModal(k.id)}
                              className="p-1 text-green-500 hover:text-green-700"
                              title="Input Hasil"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => hapusPermintaan(k.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Input Hasil Konsul */}
      {modalHasil.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Input Hasil Konsultasi</h3>
              <button
                onClick={() => setModalHasil({ open: false, konsulId: null, hasil: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasil / Rekomendasi Konsul
              </label>
              <textarea
                rows={5}
                value={modalHasil.hasil}
                onChange={(e) => setModalHasil(prev => ({ ...prev, hasil: e.target.value }))}
                placeholder="Tuliskan hasil konsultasi, rekomendasi, dan rencana tindak lanjut..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setModalHasil({ open: false, konsulId: null, hasil: '' })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={submitHasilKonsul}
                className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Simpan Hasil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermintaanKonsul;