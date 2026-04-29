// backend/src/controllers/rekamMedisController.js
const { supabase } = require('../config/supabase');
const crypto = require('crypto');
const blockchainService = require('../services/blockchainService');

const SYSTEM_PIN = process.env.VERIFICATION_PIN || '123456';

// Generate hash dari data
const generateDataHash = (data) => {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(sortedData).digest('hex');
};

// Generate record ID unik
const generateRecordId = (patientId, type) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${patientId}_${type}_${timestamp}_${random}`;
};

// Proses blockchain di background
const processBlockchainVerification = async (recordId, dataHash, recordType, patientId, userId, version, dbRecordId) => {
  try {
    console.log(`🔄 Processing blockchain verification for ${recordId}...`);
    
    const result = await blockchainService.storeHash(
      recordId, dataHash, recordType, patientId, userId, version
    );
    
    if (result.success) {
      const blockNumber = result.blockNumber !== undefined && result.blockNumber !== null
        ? Number(result.blockNumber)
        : null;
      
      const { error: updateError } = await supabase
        .from('asesmen_medis')
        .update({
          blockchain_tx_hash: result.transactionHash,
          blockchain_block_number: blockNumber,
          blockchain_verified: true
        })
        .eq('id', dbRecordId);
      
      if (updateError) {
        console.error('Failed to update record:', updateError);
      } else {
        console.log(`✅ Record ${recordId} verified on blockchain`);
        console.log(`   Tx Hash: ${result.transactionHash}`);
        console.log(`   Block: ${blockNumber}`);
      }
    } else if (result.skipped) {
      console.log(`⚠️ Blockchain skipped: ${result.error}`);
    } else {
      console.error(`❌ Blockchain verification failed: ${result.error}`);
      
      await supabase
        .from('asesmen_medis')
        .update({
          blockchain_verified: false
        })
        .eq('id', dbRecordId);
    }
  } catch (error) {
    console.error('Background verification failed:', error);
  }
};

// CREATE - Simpan asesmen medis (DENGAN blockchain otomatis)
const createRekamMedis = async (req, res) => {
  try {
    const { data, patientId, recordType, pin } = req.body;
    const userId = req.user?.id;
    
    console.log('📝 Creating medical record...');
    console.log('Patient ID (UUID):', patientId);
    console.log('Record Type:', recordType);
    
    // Verifikasi PIN
    if (!pin || pin !== SYSTEM_PIN) {
      return res.status(401).json({
        success: false,
        message: 'PIN salah. Transaksi dibatalkan.'
      });
    }
    
    // Validasi patientId harus UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patientId)) {
      return res.status(400).json({
        success: false,
        message: `Format patient_id tidak valid. Harus berupa UUID, received: ${patientId}`
      });
    }
    
    // Generate hash
    const dataHash = generateDataHash(data);
    const recordId = generateRecordId(patientId, recordType);
    const version = 1;
    
    console.log(`🔐 Data hash: ${dataHash}`);
    console.log(`📌 Record ID: ${recordId}`);
    
    // Simpan ke Supabase
    const recordData = {
      record_id: recordId,
      version: version,
      patient_id: patientId,
      data: data,
      data_hash: dataHash,
      status: 'active',
      action_type: 'create',
      change_reason: 'Initial record creation',
      created_by: userId,
      blockchain_verified: false,
      created_at: new Date().toISOString()
    };
    
    const { data: savedRecord, error: dbError } = await supabase
      .from('asesmen_medis')
      .insert([recordData])
      .select();
    
    if (dbError) {
      console.error('DB Error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan ke database: ' + dbError.message
      });
    }
    
    console.log('✅ Data saved to Supabase');
    console.log('Saved record ID:', savedRecord[0]?.id);
    
    // Kirim response awal ke frontend
    res.status(200).json({
      success: true,
      message: 'Data berhasil disimpan! Sedang memverifikasi ke blockchain...',
      data: savedRecord[0],
      blockchainStatus: 'pending'
    });
    
    // Proses blockchain di BACKGROUND (tidak nge-block response)
    setImmediate(() => {
      processBlockchainVerification(
        recordId, 
        dataHash, 
        recordType, 
        patientId, 
        userId, 
        version, 
        savedRecord[0].id
      );
    });
    
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE - Update status blockchain setelah verifikasi dari frontend (opsional)
const updateBlockchainStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockchain_tx_hash, blockchain_block_number } = req.body;
    
    const { data, error } = await supabase
      .from('asesmen_medis')
      .update({
        blockchain_tx_hash: blockchain_tx_hash,
        blockchain_block_number: blockchain_block_number,
        blockchain_verified: true
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    console.log(`✅ Blockchain status updated for record ${id}`);
    console.log(`   Tx Hash: ${blockchain_tx_hash}`);
    
    res.json({
      success: true,
      message: 'Blockchain status updated',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Update blockchain status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET - Cek status asesmen medis
const getStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('asesmen_medis')
      .select('blockchain_verified, blockchain_tx_hash, blockchain_block_number, status, data_hash, record_id')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET - Ambil semua asesmen medis berdasarkan patient_id
const getByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const { data, error } = await supabase
      .from('asesmen_medis')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get by patient error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { 
  createRekamMedis, 
  getStatus, 
  getByPatientId,
  updateBlockchainStatus
};