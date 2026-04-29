// utils/igdUtils.js

// Hitung usia dari tanggal lahir
export const calculateAge = (birthDate) => {
  if (!birthDate) return '-';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} Thn`;
};

// Format tanggal
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format gender
export const formatGender = (gender) => {
  if (gender === 'LAKI_LAKI') return 'Laki-laki';
  if (gender === 'PEREMPUAN') return 'Perempuan';
  return gender || '-';
};

// Format status encounter
export const getStatusLabel = (status) => {
  const labels = {
    'TRIAGE': 'Triage',
    'ONGOING': 'Sedang Ditangani',
    'DISCHARGED': 'Selesai',
    'ADMITTED': 'Dirujuk Rawat Inap'
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    'TRIAGE': 'bg-yellow-100 text-yellow-700',
    'ONGOING': 'bg-teal-100 text-teal-700',
    'DISCHARGED': 'bg-gray-100 text-gray-500',
    'ADMITTED': 'bg-blue-100 text-blue-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-500';
};

// Format triage level
export const getTriageLabel = (level) => {
  const labels = {
    'RED': '🔴 Gawat Darurat',
    'YELLOW': '🟡 Kuning',
    'GREEN': '🟢 Hijau',
    'BLACK': '⚫ Meninggal'
  };
  return labels[level] || level;
};

export const getTriageColor = (level) => {
  const colors = {
    'RED': 'bg-red-100 text-red-700 border-red-200',
    'YELLOW': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'GREEN': 'bg-green-100 text-green-700 border-green-200',
    'BLACK': 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[level] || 'bg-gray-100 text-gray-500';
};