const crypto = require('crypto');

const generateDataHash = (data) => {
  // Urutkan keys agar hash konsisten
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  const hash = crypto.createHash('sha256').update(sortedData).digest('hex');
  return hash;
};

const generateRecordId = (patientId, type) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${patientId}_${type}_${timestamp}_${random}`;
};

const verifyDataIntegrity = (data, expectedHash) => {
  const currentHash = generateDataHash(data);
  return currentHash === expectedHash;
};

module.exports = { generateDataHash, generateRecordId, verifyDataIntegrity };