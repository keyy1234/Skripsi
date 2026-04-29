import React, { useState } from 'react';

const PinModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto focus ke next input
    if (value && index < 5) {
      document.getElementById(`pin-input-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = () => {
    const pinCode = pin.join('');
    if (pinCode.length !== 6) {
      setError('PIN harus 6 digit');
      return;
    }
    onConfirm(pinCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Verifikasi Keamanan</h3>
          <p className="text-sm text-gray-500 mt-1">Masukkan PIN 6 digit untuk mengotorisasi transaksi</p>
        </div>

        <div className="flex justify-center gap-3 mb-4">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              id={`pin-input-${idx}`}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(idx, e.target.value)}
              className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus={idx === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinModal;