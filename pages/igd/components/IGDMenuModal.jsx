// components/IGDMenuModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const IGDMenuModal = ({ encounter, onClose }) => {
  const navigate = useNavigate();

  const handleDetail = () => {
    onClose();
    navigate(`/igd/pasien-aktif/${encounter.encounter_id}`, { state: { encounter } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Menu Pelayanan IGD</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">
            Pasien: <span className="font-medium">{encounter.patients?.patient_name}</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDetail}
              className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
            >
              Detail Pasien
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IGDMenuModal;