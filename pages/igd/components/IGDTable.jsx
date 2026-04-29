// components/IGDTable.jsx
import React from 'react';
import IGDTableRow from './IGDTableRow';

const IGDTable = ({ encounters, activeEncounterId, onRowClick, onRowContextMenu }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
  <tr style={{ background: 'linear-gradient(90deg, #0f766e, #0d9488)' }}>
    {['WAKTU MASUK', 'PASIEN', 'TRIAGE', 'KELUHAN UTAMA', 'DOKTER', 'STATUS', 'AKSI'].map(h => (
      <th
        key={h}
        className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
      >
        {h}
      </th>
    ))}
  </tr> {/* ✅ ini yang kurang */}
</thead>
        <tbody className="divide-y divide-gray-100">
          {encounters.map((encounter) => (
            <IGDTableRow
              key={encounter.encounter_id}
              encounter={encounter}
              isActive={activeEncounterId === encounter.encounter_id}
              onClick={() => onRowClick(encounter)}
              onContextMenu={(e) => onRowContextMenu(e, encounter)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IGDTable;