import React from 'react';

const StatusFungsional = ({ patient, data, onDataChange }) => {
  // Data diterima dari parent, bukan state internal
  const barthel = data || {
    bowel: { value: 0, label: 'Inkontinen/tidak teratur (perlu enema)' },
    bladder: { value: 0, label: 'Inkontinen atau pakai kateter dan tak terkontrol' },
    grooming: { value: 0, label: 'Butuh pertolongan orang lain' },
    toilet: { value: 0, label: 'Tidak mampu' },
    feeding: { value: 0, label: 'Tidak mampu' },
    transfer: { value: 0, label: 'Tidak mampu' },
    mobility: { value: 0, label: 'Tidak mampu' },
    dressing: { value: 0, label: 'Tergantung' },
    stairs: { value: 0, label: 'Tidak mampu' },
    bathing: { value: 0, label: 'Tergantung' }
  };

  // Hitung total skor Barthel Index
  const totalSkor = Object.values(barthel).reduce((sum, item) => sum + (item?.value || 0), 0);
  
  // Tentukan tingkat ketergantungan
  const getDependencyLevel = () => {
    if (totalSkor >= 20) return { level: 'Mandiri', color: 'text-green-600', bg: 'bg-green-100' };
    if (totalSkor >= 15) return { level: 'Ketergantungan Ringan', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (totalSkor >= 10) return { level: 'Ketergantungan Sedang', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (totalSkor >= 5) return { level: 'Ketergantungan Berat', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Ketergantungan Total', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const dependency = getDependencyLevel();

  // Options untuk setiap fungsi
  const bowelOptions = [
    { value: 0, label: 'Inkontinen/tidak teratur (perlu enema)' },
    { value: 1, label: 'Kadang-kadang inkontinen (1x seminggu)' },
    { value: 2, label: 'Kontinen teratur' }
  ];

  const bladderOptions = [
    { value: 0, label: 'Inkontinen atau pakai kateter dan tak terkontrol' },
    { value: 1, label: 'Kadang-kadang inkontinen (max 1x24 jam)' },
    { value: 2, label: 'Mandiri' }
  ];

  const groomingOptions = [
    { value: 0, label: 'Butuh pertolongan orang lain' },
    { value: 1, label: 'Mandiri' }
  ];

  const toiletOptions = [
    { value: 0, label: 'Tidak mampu' },
    { value: 1, label: 'Perlu bantuan (membuka pakaian, membersihkan)' },
    { value: 2, label: 'Mandiri' }
  ];

  const feedingOptions = [
    { value: 0, label: 'Tidak mampu' },
    { value: 1, label: 'Perlu bantuan (memotong, membuka wadah)' },
    { value: 2, label: 'Mandiri' }
  ];

  const transferOptions = [
    { value: 0, label: 'Tidak mampu' },
    { value: 1, label: 'Perlu bantuan besar (2 orang)' },
    { value: 2, label: 'Perlu bantuan kecil (1 orang)' },
    { value: 3, label: 'Mandiri' }
  ];

  const mobilityOptions = [
    { value: 0, label: 'Tidak mampu' },
    { value: 1, label: 'Dengan kursi roda (mandiri)' },
    { value: 2, label: 'Berjalan dengan bantuan 1 orang' },
    { value: 3, label: 'Mandiri' }
  ];

  const dressingOptions = [
    { value: 0, label: 'Tergantung' },
    { value: 1, label: 'Perlu bantuan (memasang kancing)' },
    { value: 2, label: 'Mandiri' }
  ];

  const stairsOptions = [
    { value: 0, label: 'Tidak mampu' },
    { value: 1, label: 'Perlu bantuan' },
    { value: 2, label: 'Mandiri' }
  ];

  const bathingOptions = [
    { value: 0, label: 'Tergantung' },
    { value: 1, label: 'Mandiri' }
  ];

  // Fungsi update yang memanggil onDataChange dari parent
  const updateBarthel = (category, value, label) => {
    if (onDataChange) {
      onDataChange({
        ...barthel,
        [category]: { value, label }
      });
    }
  };

  const items = [
    { id: 'bowel', label: 'Mengontrol BAB', options: bowelOptions },
    { id: 'bladder', label: 'Mengontrol BAK', options: bladderOptions },
    { id: 'grooming', label: 'Membersihkan diri (lap muka, sisir rambut, sikat gigi)', options: groomingOptions },
    { id: 'toilet', label: 'Penggunaan toilet (pergi ke/keluar dari WC)', options: toiletOptions },
    { id: 'feeding', label: 'Makan', options: feedingOptions },
    { id: 'transfer', label: 'Berpindah tempat (dari tidur ke duduk, ke kursi)', options: transferOptions },
    { id: 'mobility', label: 'Mobilitas (berjalan di ruangan, luar ruangan)', options: mobilityOptions },
    { id: 'dressing', label: 'Berpakaian', options: dressingOptions },
    { id: 'stairs', label: 'Naik turun tangga', options: stairsOptions },
    { id: 'bathing', label: 'Mandi', options: bathingOptions }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header dengan Total Skor */}
      <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Barthel Index - Status Fungsional</h3>
            <p className="text-xs text-gray-500">Penilaian kemampuan aktivitas sehari-hari</p>
          </div>
          <div className={`${dependency.bg} rounded-lg px-4 py-2 text-center`}>
            <p className="text-xs font-medium text-gray-600">Total Skor</p>
            <p className="text-3xl font-bold text-gray-800">{totalSkor}</p>
            <p className={`text-sm font-semibold ${dependency.color}`}>{dependency.level}</p>
          </div>
        </div>
      </div>

      {/* Tabel Penilaian */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-12">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Keterangan</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide w-32">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-sm text-gray-500 font-medium">
                    {(idx + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <div className="mt-2 space-y-1">
                      {item.options.map((opt, optIdx) => (
                        <label key={optIdx} className="flex items-start gap-2 cursor-pointer py-1">
                          <input
                            type="radio"
                            name={item.id}
                            value={opt.value}
                            checked={barthel[item.id]?.value === opt.value}
                            onChange={() => updateBarthel(item.id, opt.value, opt.label)}
                            className="mt-0.5 w-4 h-4 accent-teal-500"
                          />
                          <span className="text-xs text-gray-600">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-sm font-bold text-gray-700">
                      {barthel[item.id]?.value ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan="2" className="px-4 py-3 text-right font-semibold text-gray-700">
                  Total Skor
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-500 text-white font-bold text-lg">
                    {totalSkor}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Interpretasi Skor */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Interpretasi Skor Barthel Index</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="p-2 rounded bg-green-100 text-green-700 text-center">
            <p className="font-bold">20</p>
            <p>Mandiri</p>
          </div>
          <div className="p-2 rounded bg-blue-100 text-blue-700 text-center">
            <p className="font-bold">15-19</p>
            <p>Ketergantungan Ringan</p>
          </div>
          <div className="p-2 rounded bg-yellow-100 text-yellow-700 text-center">
            <p className="font-bold">10-14</p>
            <p>Ketergantungan Sedang</p>
          </div>
          <div className="p-2 rounded bg-orange-100 text-orange-700 text-center">
            <p className="font-bold">5-9</p>
            <p>Ketergantungan Berat</p>
          </div>
          <div className="p-2 rounded bg-red-100 text-red-700 text-center">
            <p className="font-bold">0-4</p>
            <p>Ketergantungan Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusFungsional;