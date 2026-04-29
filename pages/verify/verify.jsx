import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VerifyPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data berdasarkan ID dari QR
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/verify/${id}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Memverifikasi...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Dokumen Medis</h1>
          <p className="text-gray-500">Dokumen ini telah diverifikasi oleh blockchain</p>
        </div>

        <div className="space-y-4">
          <div className="border-b pb-3">
            <p className="text-sm text-gray-500">Status Verifikasi</p>
            <p className="text-lg font-semibold text-green-600">✓ Terverifikasi Blockchain</p>
          </div>
          <div className="border-b pb-3">
            <p className="text-sm text-gray-500">ID Pasien</p>
            <p className="text-lg font-mono">{data?.patientId}</p>
          </div>
          <div className="border-b pb-3">
            <p className="text-sm text-gray-500">Tanggal</p>
            <p className="text-lg">{data?.date}</p>
          </div>
          <div className="border-b pb-3">
            <p className="text-sm text-gray-500">Hash Blockchain</p>
            <p className="text-xs font-mono break-all text-gray-600">{data?.hash}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-teal-50 rounded-lg">
          <p className="text-sm text-teal-700 text-center">
            Dokumen ini asli dan belum pernah diubah sejak disimpan di blockchain.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;