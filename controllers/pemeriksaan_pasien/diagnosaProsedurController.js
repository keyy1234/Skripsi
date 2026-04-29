const { supabase } = require('../../config/supabase');
const crypto = require('crypto');
const blockchainService = require('../../services/blockchainService');

// Generate hash dari data
const generateDataHash = (data) => {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(sortedData).digest('hex');
};

// Proses blockchain di background
const processBlockchainVerification = async (id, patientId, dataHash, recordType) => {
  try {
    console.log(`🔄 Processing blockchain verification for diagnosa_prosedur ${id}...`);
    
    const recordId = `diagnosa_${id}_${Date.now()}`;
    const userId = 'system';
    const version = 1;
    
    const result = await blockchainService.storeHash(
      recordId,
      dataHash,
      recordType,
      patientId,
      userId,
      version
    );
    
    if (result.success) {
      const blockNumber = result.blockNumber !== undefined && result.blockNumber !== null
        ? Number(result.blockNumber)
        : null;
      
      const { error: updateError } = await supabase
        .from('diagnosa_prosedur')
        .update({
          blockchain_tx_hash: result.transactionHash,
          blockchain_block_number: blockNumber,
          blockchain_verified: true
        })
        .eq('id', id);
      
      if (updateError) {
        console.error('Failed to update record:', updateError);
      } else {
        console.log(`✅ Diagnosa Prosedur ${id} verified on blockchain`);
        console.log(`   Tx Hash: ${result.transactionHash}`);
        console.log(`   Block: ${blockNumber}`);
      }
    } else if (result.skipped) {
      console.log(`⚠️ Blockchain skipped: ${result.error}`);
    } else {
      console.error(`❌ Blockchain verification failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Background verification failed:', error);
  }
};

// ============================================
// CREATE - Simpan diagnosa & prosedur
// ============================================
const createDiagnosaProsedur = async (req, res) => {
  try {
    const {
      patient_id,
      admisi_id,
      no_registrasi,
      diagnosa_utama_kode,
      diagnosa_utama_nama,
      diagnosa_utama_catatan,
      diagnosa_penyerta,
      prosedur,
      notes
    } = req.body;
    
    const userId = req.user?.id;
    
    console.log('📝 Creating diagnosa & prosedur...');
    console.log('Patient ID:', patient_id);
    console.log('Diagnosa Utama:', diagnosa_utama_kode, diagnosa_utama_nama);
    console.log('Diagnosa Penyerta:', diagnosa_penyerta?.length || 0);
    console.log('Prosedur:', prosedur?.length || 0);
    
    // Validasi required fields
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID wajib diisi'
      });
    }
    
    // Generate hash dari data
    const dataForHash = {
      patient_id,
      diagnosa_utama_kode,
      diagnosa_utama_nama,
      diagnosa_utama_catatan,
      diagnosa_penyerta,
      prosedur,
      created_at: new Date().toISOString()
    };
    const dataHash = generateDataHash(dataForHash);
    
    // Data yang akan disimpan
    const diagnosaData = {
      patient_id,
      admisi_id: admisi_id || null,
      no_registrasi: no_registrasi || null,
      diagnosa_utama_kode: diagnosa_utama_kode || null,
      diagnosa_utama_nama: diagnosa_utama_nama || null,
      diagnosa_utama_catatan: diagnosa_utama_catatan || null,
      diagnosa_penyerta: diagnosa_penyerta || [],
      prosedur: prosedur || [],
      status: 'completed',
      data_hash: dataHash,
      blockchain_verified: false,
      created_by: userId,
      notes: notes || null,
      created_at: new Date().toISOString()
    };
    
    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('diagnosa_prosedur')
      .insert([diagnosaData])
      .select();
    
    if (error) {
      console.error('DB Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan data: ' + error.message
      });
    }
    
    console.log('✅ Diagnosa Prosedur saved to Supabase');
    console.log('Saved record ID:', data[0]?.id);
    
    // Kirim response awal ke frontend
    res.status(201).json({
      success: true,
      message: 'Diagnosa & Prosedur berhasil disimpan',
      data: data[0],
      blockchainStatus: 'pending'
    });
    
    // Proses blockchain di BACKGROUND
    setImmediate(() => {
      processBlockchainVerification(data[0].id, patient_id, dataHash, 'diagnosa_prosedur');
    });
    
  } catch (error) {
    console.error('Create diagnosa prosedur error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// READ - Ambil semua diagnosa prosedur
// ============================================
const getAllDiagnosaProsedur = async (req, res) => {
  try {
    const { patient_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('diagnosa_prosedur')
      .select(`
        *,
        pasien:patient_id (
          id,
          name,
          nik,
          no_rm
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all diagnosa prosedur error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// READ - Ambil diagnosa prosedur berdasarkan ID
// ============================================
const getDiagnosaProsedurById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('diagnosa_prosedur')
      .select(`
        *,
        pasien:patient_id (
          id,
          name,
          nik,
          no_rm,
          gender,
          birth_date
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Data tidak ditemukan'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get diagnosa prosedur by id error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE - Update diagnosa prosedur
// ============================================
const updateDiagnosaProsedur = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosa_utama_kode,
      diagnosa_utama_nama,
      diagnosa_utama_catatan,
      diagnosa_penyerta,
      prosedur,
      notes
    } = req.body;
    const userId = req.user?.id;
    
    const { data: existingData, error: findError } = await supabase
      .from('diagnosa_prosedur')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan'
      });
    }
    
    const updateData = {
      diagnosa_utama_kode: diagnosa_utama_kode || existingData.diagnosa_utama_kode,
      diagnosa_utama_nama: diagnosa_utama_nama || existingData.diagnosa_utama_nama,
      diagnosa_utama_catatan: diagnosa_utama_catatan || existingData.diagnosa_utama_catatan,
      diagnosa_penyerta: diagnosa_penyerta || existingData.diagnosa_penyerta,
      prosedur: prosedur || existingData.prosedur,
      notes: notes || existingData.notes,
      updated_at: new Date().toISOString()
    };
    
    // Generate ulang hash
    const dataForHash = {
      patient_id: existingData.patient_id,
      diagnosa_utama_kode: updateData.diagnosa_utama_kode,
      diagnosa_utama_nama: updateData.diagnosa_utama_nama,
      diagnosa_utama_catatan: updateData.diagnosa_utama_catatan,
      diagnosa_penyerta: updateData.diagnosa_penyerta,
      prosedur: updateData.prosedur,
      updated_at: new Date().toISOString()
    };
    updateData.data_hash = generateDataHash(dataForHash);
    updateData.blockchain_verified = false;
    
    const { data, error } = await supabase
      .from('diagnosa_prosedur')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Data berhasil diupdate',
      data: data[0]
    });
    
    // Proses ulang blockchain
    setImmediate(() => {
      processBlockchainVerification(id, existingData.patient_id, updateData.data_hash, 'diagnosa_prosedur');
    });
    
  } catch (error) {
    console.error('Update diagnosa prosedur error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// DELETE - Hapus diagnosa prosedur
// ============================================
const deleteDiagnosaProsedur = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('diagnosa_prosedur')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Data berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete diagnosa prosedur error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE - Update blockchain status
// ============================================
const updateBlockchainStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockchain_tx_hash, blockchain_block_number } = req.body;
    
    const { data, error } = await supabase
      .from('diagnosa_prosedur')
      .update({
        blockchain_tx_hash: blockchain_tx_hash,
        blockchain_block_number: blockchain_block_number,
        blockchain_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    console.log(`✅ Blockchain status updated for diagnosa_prosedur ${id}`);
    
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

module.exports = {
  createDiagnosaProsedur,
  getAllDiagnosaProsedur,
  getDiagnosaProsedurById,
  updateDiagnosaProsedur,
  deleteDiagnosaProsedur,
  updateBlockchainStatus
};