import React from 'react';

const SaveBtn = ({ onClick, text = 'Simpan' }) => (
  <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
    <button
      onClick={onClick}
      className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow-sm flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {text}
    </button>
  </div>
);

export default SaveBtn;