const { supabase } = require('../../config/supabase');
const crypto = require('crypto');
const blockchainService = require('../../services/blockchainService');

const generateDataHash = (data) => {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(sortedData).digest('hex');
};

const processBlockchainVerification = async (id, patientId, dataHash) => {
  try {
    console.log(`🔄 Processing blockchain verification for resep ${id}...`);
    
    const recordId = `resep_${id}_${Date.now()}`;
    const userId = 'system';
    const version = 1;
    
    const result = await blockchainService.storeHash(recordId, dataHash, 'resep', patientId, userId, version);
    
    if (result.success) {
      const blockNumber = Number(result.blockNumber);
      await supabase.from('resep').update({
        blockchain_tx_hash: result.transactionHash,
        blockchain_block_number: blockNumber,
        blockchain_verified: true
      }).eq('id', id);
      console.log(`✅ Resep ${id} verified on blockchain`);
    }
  } catch (error) {
    console.error('Blockchain verification failed:', error);
  }
};

const createResep = async (req, res) => {
  try {
    const { patient_id, admisi_id, no_registrasi, resep_pulang, items } = req.body;
    const userId = req.user?.id;
    
    if (!patient_id) return res.status(400).json({ success: false, message: 'Patient ID wajib diisi' });
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Minimal satu resep harus ditambahkan' });
    
    const dataHash = generateDataHash({ patient_id, resep_pulang, items, created_at: new Date().toISOString() });
    
    const resepData = {
      patient_id, admisi_id: admisi_id || null, no_registrasi: no_registrasi || null,
      resep_pulang: resep_pulang || 'Tidak', items, status: 'completed',
      prescribed_by: userId, prescribed_at: new Date().toISOString(),
      data_hash: dataHash, blockchain_verified: false,
      created_by: userId, created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase.from('resep').insert([resepData]).select();
    if (error) throw error;
    
    res.status(201).json({ success: true, message: 'Resep berhasil disimpan', data: data[0], blockchainStatus: 'pending' });
    
    setImmediate(() => processBlockchainVerification(data[0].id, patient_id, dataHash));
  } catch (error) {
    console.error('Create resep error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllResep = async (req, res) => {
  try {
    const { patient_id } = req.query;
    let query = supabase.from('resep').select('*').order('created_at', { ascending: false });
    if (patient_id) query = query.eq('patient_id', patient_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResepById = async (req, res) => {
  try {
    const { data, error } = await supabase.from('resep').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteResep = async (req, res) => {
  try {
    const { error } = await supabase.from('resep').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Resep berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createResep, getAllResep, getResepById, deleteResep };