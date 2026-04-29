// components/IGDTableRow.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, calculateAge, formatGender, getTriageLabel, getTriageColor, getStatusLabel, getStatusColor } from '../utils/igdUtils';

const IGDTableRow = ({ encounter, isActive, onClick, onContextMenu }) => {
  const navigate = useNavigate();

  const handleNavigate = (e) => {
    e.stopPropagation();
    navigate(`/igd/pasien-aktif/${encounter.encounter_id}`, { state: { encounter } });
  };

  return (
    <tr
      onClick={onClick}
      onContextMenu={onContextMenu}
      title="Klik kiri: menu pelayanan | Klik kanan: detail pasien"
      className={`cursor-pointer transition-colors group select-none ${
        isActive
          ? 'bg-teal-50 border-l-4 border-teal-500'
          : 'hover:bg-teal-50/40 border-l-4 border-transparent'
      }`}
    >
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
        {formatDate(encounter.encounter_start_time)}
      </td>
      <td className="px-4 py-3">
        <p className="text-teal-600 font-medium group-hover:underline">
          {encounter.patients?.patient_name || '-'}
        </p>
        <p className="text-xs text-gray-400 font-mono">
          NIK: {encounter.patients?.nik?.slice(-6) || '-'}
        </p>
        <p className="text-xs text-gray-400">
          {formatGender(encounter.patients?.gender)} · {calculateAge(encounter.patients?.date_of_birth)} · {encounter.patients?.phone_number || '-'}
        </p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getTriageColor(encounter.triage_level)}`}>
          {getTriageLabel(encounter.triage_level)}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-700 max-w-xs line-clamp-2">
          {encounter.chief_complaint || '-'}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-800">{encounter.medic_staff?.staff_name || '-'}</p>
        <p className="text-xs text-teal-500">{encounter.medic_staff?.specialization || '-'}</p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(encounter.status)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            encounter.status === 'ONGOING' ? 'bg-teal-500 animate-pulse' :
            encounter.status === 'TRIAGE' ? 'bg-yellow-500 animate-pulse' :
            'bg-gray-400'
          }`} />
          {getStatusLabel(encounter.status)}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {(encounter.status === 'ONGOING' || encounter.status === 'TRIAGE') ? (
          <button
            onClick={handleNavigate}
            className="px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200"
          >
            Lanjutkan
          </button>
        ) : encounter.status === 'ADMITTED' ? (
          <span className="text-xs text-blue-600">Dirujuk ke Rawat Inap</span>
        ) : (
          <span className="text-xs text-gray-400">Selesai</span>
        )}
      </td>
    </tr>
  );
};

export default IGDTableRow;