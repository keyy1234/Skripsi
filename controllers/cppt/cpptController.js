const { supabase } = require('../../config/supabase');
const crypto = require('crypto');
const blockchainService = require('../../services/blockchainService');

// Generate hash dari data
const generateDataHash = (data) => {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(sortedData).digest('hex');
};

// Proses blockchain di background
const processBlockchainVerification = async (id, patientId, dataHash) => {
  try {
    console.log(`🔄 Processing blockchain verification for CPPT ${id}...`);
    
    const recordId = `cppt_${id}_${Date.now()}`;
    const userId = 'system';
    const version = 1;
    
    const result = await blockchainService.storeHash(
      recordId,
      dataHash,
      'cppt',
      patientId,
      userId,
      version
    );
    
    if (result.success) {
      const blockNumber = result.blockNumber !== undefined && result.blockNumber !== null
        ? Number(result.blockNumber)
        : null;
      
      const { error: updateError } = await supabase
        .from('cppt')
        .update({
          blockchain_tx_hash: result.transactionHash,
          blockchain_block_number: blockNumber,
          blockchain_verified: true
        })
        .eq('id', id);
      
      if (updateError) {
        console.error('Failed to update record:', updateError);
      } else {
        console.log(`✅ CPPT ${id} verified on blockchain`);
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
// CREATE - Simpan CPPT baru
// ============================================
const createCPPT = async (req, res) => {
  try {
    const {
      patient_id,
      admisi_id,
      no_registrasi,
      no_rm,
      subjective,
      objective,
      assessment,
      planning,
      instruksi_ppa,
      sbar_situation,
      sbar_background,
      sbar_assessment,
      sbar_recommendation,
      handover_perawat,
      lapor_dokter,
      notes
    } = req.body;
    
    const userId = req.user?.id;
    
    console.log('📝 Creating CPPT...');
    console.log('Patient ID:', patient_id);
    console.log('Subjective:', subjective?.substring(0, 50));
    
    // Validasi required fields
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID wajib diisi'
      });
    }
    
    if (!subjective) {
      return res.status(400).json({
        success: false,
        message: 'Subjective (keluhan pasien) wajib diisi'
      });
    }
    
    // Generate hash dari data
    const dataForHash = {
      patient_id,
      subjective,
      objective,
      assessment,
      planning,
      instruksi_ppa,
      sbar_situation,
      sbar_background,
      sbar_assessment,
      sbar_recommendation,
      created_at: new Date().toISOString()
    };
    const dataHash = generateDataHash(dataForHash);
    
    // Data yang akan disimpan
    const cpptData = {
      patient_id,
      admisi_id: admisi_id || null,
      no_registrasi: no_registrasi || null,
      no_rm: no_rm || null,
      subjective: subjective || null,
      objective: objective || null,
      assessment: assessment || null,
      planning: planning || null,
      instruksi_ppa: instruksi_ppa || null,
      sbar_situation: sbar_situation || null,
      sbar_background: sbar_background || null,
      sbar_assessment: sbar_assessment || null,
      sbar_recommendation: sbar_recommendation || null,
      handover_perawat: handover_perawat || null,
      lapor_dokter: lapor_dokter || null,
      status: 'completed',
      data_hash: dataHash,
      blockchain_verified: false,
      created_by: userId,
      notes: notes || null,
      created_at: new Date().toISOString()
    };
    
    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('cppt')
      .insert([cpptData])
      .select();
    
    if (error) {
      console.error('DB Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan data: ' + error.message
      });
    }
    
    console.log('✅ CPPT saved to Supabase');
    console.log('Saved record ID:', data[0]?.id);
    
    // Kirim response awal ke frontend
    res.status(201).json({
      success: true,
      message: 'CPPT berhasil disimpan',
      data: data[0],
      blockchainStatus: 'pending'
    });
    
    // Proses blockchain di BACKGROUND
    setImmediate(() => {
      processBlockchainVerification(data[0].id, patient_id, dataHash);
    });
    
  } catch (error) {
    console.error('Create CPPT error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// READ - Ambil semua CPPT
// ============================================
// ============================================
// READ - Ambil semua CPPT
// ============================================
const getAllCPPT = async (req, res) => {
  try {
    const { patient_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('cppt')
      .select(`
        *,
        pasien:patient_id (
          id,
          name,
          nik
        ),
        created_by_profile:created_by (
          id,
          user_id,
          name
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
    console.error('Get all CPPT error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// READ - Ambil CPPT berdasarkan ID
// ============================================
const getCPPTById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('cppt')
      .select(`
        *,
        pasien:patient_id (
          id,
          name,
          nik,
          no_rm,
          gender,
          birth_date
        ),
        created_by_profile:created_by (
          id,
          user_id,
          name
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'CPPT tidak ditemukan'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get CPPT by id error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE - Update CPPT
// ============================================
const updateCPPT = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subjective,
      objective,
      assessment,
      planning,
      instruksi_ppa,
      sbar_situation,
      sbar_background,
      sbar_assessment,
      sbar_recommendation,
      handover_perawat,
      lapor_dokter,
      notes
    } = req.body;
    const userId = req.user?.id;
    
    const { data: existingData, error: findError } = await supabase
      .from('cppt')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'CPPT tidak ditemukan'
      });
    }
    
    const updateData = {
      subjective: subjective !== undefined ? subjective : existingData.subjective,
      objective: objective !== undefined ? objective : existingData.objective,
      assessment: assessment !== undefined ? assessment : existingData.assessment,
      planning: planning !== undefined ? planning : existingData.planning,
      instruksi_ppa: instruksi_ppa !== undefined ? instruksi_ppa : existingData.instruksi_ppa,
      sbar_situation: sbar_situation !== undefined ? sbar_situation : existingData.sbar_situation,
      sbar_background: sbar_background !== undefined ? sbar_background : existingData.sbar_background,
      sbar_assessment: sbar_assessment !== undefined ? sbar_assessment : existingData.sbar_assessment,
      sbar_recommendation: sbar_recommendation !== undefined ? sbar_recommendation : existingData.sbar_recommendation,
      handover_perawat: handover_perawat !== undefined ? handover_perawat : existingData.handover_perawat,
      lapor_dokter: lapor_dokter !== undefined ? lapor_dokter : existingData.lapor_dokter,
      notes: notes !== undefined ? notes : existingData.notes,
      updated_at: new Date().toISOString()
    };
    
    // Generate ulang hash
    const dataForHash = {
      patient_id: existingData.patient_id,
      subjective: updateData.subjective,
      objective: updateData.objective,
      assessment: updateData.assessment,
      planning: updateData.planning,
      instruksi_ppa: updateData.instruksi_ppa,
      updated_at: new Date().toISOString()
    };
    updateData.data_hash = generateDataHash(dataForHash);
    updateData.blockchain_verified = false;
    
    const { data, error } = await supabase
      .from('cppt')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'CPPT berhasil diupdate',
      data: data[0]
    });
    
    // Proses ulang blockchain
    setImmediate(() => {
      processBlockchainVerification(id, existingData.patient_id, updateData.data_hash);
    });
    
  } catch (error) {
    console.error('Update CPPT error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// DELETE - Hapus CPPT
// ============================================
const deleteCPPT = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('cppt')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'CPPT berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete CPPT error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE - Verifikasi DPJP
// ============================================
const verifyDPJP = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;
    const userId = req.user?.id;
    
    const { data, error } = await supabase
      .from('cppt')
      .update({
        dpjp_verifikasi: true,
        dpjp_verifikasi_at: new Date().toISOString(),
        dpjp_catatan: catatan || null,
        status: 'verified'
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'CPPT berhasil diverifikasi DPJP',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Verify DPJP error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE - Update blockchain status (manual)
// ============================================
const updateBlockchainStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockchain_tx_hash, blockchain_block_number } = req.body;
    
    const { data, error } = await supabase
      .from('cppt')
      .update({
        blockchain_tx_hash: blockchain_tx_hash,
        blockchain_block_number: blockchain_block_number,
        blockchain_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    console.log(`✅ Blockchain status updated for CPPT ${id}`);
    
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
  createCPPT,
  getAllCPPT,
  getCPPTById,
  updateCPPT,
  deleteCPPT,
  verifyDPJP,
  updateBlockchainStatus
};