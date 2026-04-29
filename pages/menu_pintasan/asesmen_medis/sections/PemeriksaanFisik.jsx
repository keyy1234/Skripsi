import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { FormField, TextArea } from '../components/FormField';
import SaveBtn from '../components/SaveBtn';
import { ORGAN_LIST } from '../data/constants';

const PemeriksaanFisik = forwardRef((props, ref) => {
  const [status, setStatus] = useState(Object.fromEntries(ORGAN_LIST.map(o => [o, { val: 'Normal', note: '' }])));
  const [catatanGambar, setCatatanGambar] = useState('');
  const [clickedPoints, setClickedPoints] = useState([]);

  useImperativeHandle(ref, () => ({
    getData: () => {
      const organStatus = {};
      ORGAN_LIST.forEach(organ => {
        organStatus[organ.toLowerCase().replace(/ /g, '_')] = {
          status: status[organ].val,
          keterangan: status[organ].note
        };
      });
      
      return {
        pemeriksaan_fisik: organStatus,
        catatan_gambar: catatanGambar,
        titik_keluhan: clickedPoints
      };
    }
  }));

  const toggle = (organ, val) => setStatus(s => ({ ...s, [organ]: { ...s[organ], val } }));
  const setNote = (organ, note) => setStatus(s => ({ ...s, [organ]: { ...s[organ], note } }));

  const handleBodyClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    setClickedPoints(pts => [...pts, { x, y, id: Date.now() }]);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <p className="text-xs text-gray-500 mb-2">Klik pada gambar untuk menandai area keluhan</p>
          <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 cursor-crosshair" style={{ minHeight: 320 }} onClick={handleBodyClick}>
            <svg viewBox="0 0 340 420" className="w-full" fill="none">
              <g transform="translate(20,10)">
                <ellipse cx="60" cy="28" rx="22" ry="28" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="38" y="56" width="44" height="70" rx="6" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="18" y="58" width="18" height="60" rx="8" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="84" y="58" width="18" height="60" rx="8" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="38" y="126" width="20" height="80" rx="6" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="60" y="126" width="20" height="80" rx="6" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="36" y="204" width="20" height="50" rx="5" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="58" y="204" width="20" height="50" rx="5" stroke="#ccc" strokeWidth="1.5"/>
                <text x="60" y="270" textAnchor="middle" fontSize="10" fill="#999">Depan</text>
              </g>
              <g transform="translate(190,10)">
                <ellipse cx="60" cy="28" rx="22" ry="28" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="38" y="56" width="44" height="70" rx="6" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="18" y="58" width="18" height="60" rx="8" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="84" y="58" width="18" height="60" rx="8" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="38" y="126" width="20" height="80" rx="6" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="60" y="126" width="20" height="80" rx="6" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="36" y="204" width="20" height="50" rx="5" stroke="#ccc" strokeWidth="1.5"/>
                <rect x="58" y="204" width="20" height="50" rx="5" stroke="#ccc" strokeWidth="1.5"/>
                <text x="60" y="270" textAnchor="middle" fontSize="10" fill="#999">Belakang</text>
              </g>
            </svg>
            {clickedPoints.map(p => (
              <div key={p.id} className="absolute w-5 h-5 border-2 border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${p.x}%`, top: `${p.y}%` }} />
            ))}
          </div>
          {clickedPoints.length > 0 && (
            <button onClick={() => setClickedPoints([])} className="mt-2 text-xs text-red-400 hover:text-red-600 transition">
              Hapus semua penanda
            </button>
          )}
          <FormField label="Penjelasan Gambar">
            <TextArea value={catatanGambar} onChange={setCatatanGambar} rows={3} placeholder="Jelaskan keluhan berdasarkan area yang ditandai..." />
          </FormField>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_1fr] bg-gray-50 border-b border-gray-200 px-4 py-2.5">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Organ</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide text-center px-4">Normal</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide text-center px-4">Abnormal</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Keterangan</span>
          </div>
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {ORGAN_LIST.map(organ => (
              <div key={organ} className="grid grid-cols-[1fr_auto_auto_1fr] items-center px-4 py-2.5 hover:bg-gray-50/50 transition">
                <span className="text-sm text-gray-700">{organ}</span>
                <label className="flex items-center gap-1.5 px-4 cursor-pointer">
                  <input type="radio" className="accent-teal-500 w-4 h-4" checked={status[organ].val === 'Normal'} onChange={() => toggle(organ, 'Normal')} />
                  <span className="text-sm text-gray-600">Normal</span>
                </label>
                <label className="flex items-center gap-1.5 px-4 cursor-pointer">
                  <input type="radio" className="accent-red-500 w-4 h-4" checked={status[organ].val === 'Abnormal'} onChange={() => toggle(organ, 'Abnormal')} />
                  <span className="text-sm text-gray-600">Abnormal</span>
                </label>
                <input
                  type="text"
                  value={status[organ].note}
                  onChange={e => setNote(organ, e.target.value)}
                  placeholder={status[organ].val === 'Abnormal' ? 'keterangan...' : ''}
                  className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <SaveBtn />
    </div>
  );
});

export default PemeriksaanFisik;