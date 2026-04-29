import React from 'react';

const PatientInfoCard = ({ patient }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)' }} />
      <div className="px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">{patient.nama}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1.5 text-sm">
          <p><span className="text-gray-500">No. Registrasi: </span><span className="font-medium">{patient.noRegistrasi}</span></p>
          <p><span className="text-gray-500">Dikirim Oleh: </span><span className="font-medium">{patient.dikirimOleh}</span></p>
          <p><span className="text-gray-500">DPJP: </span><span className="font-medium">{patient.dpjp}</span></p>
          <p><span className="text-gray-500">Tanggal Masuk: </span><span className="font-medium">{patient.tanggalMasuk}</span></p>
          <p><span className="text-gray-500">Jenis Pasien: </span><span className="font-medium">{patient.jenisPasien}</span></p>
          <p><span className="text-gray-500">Tanggal Keluar: </span><span className="font-medium">{patient.tanggalKeluar}</span></p>
          <p><span className="text-gray-500">Umur: </span><span className="font-medium">{patient.umur}</span></p>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;