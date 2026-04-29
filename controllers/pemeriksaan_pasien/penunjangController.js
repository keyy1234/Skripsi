const { supabase } = require('../../config/supabase');
const crypto = require('crypto');
const blockchainService = require('../../services/blockchainService');

// Generate hash dari data
const generateDataHash = (data) => {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(sortedData).digest('hex');
};

// Proses blockchain di background
const processBlockchainVerification = async (id, patientId, dataHash, jenis, pemeriksaan_list) => {
  try {
    console.log(`🔄 Processing blockchain verification for penunjang ${id}...`);
    
    const recordId = `penunjang_${id}_${Date.now()}`;
    const userId = 'system';
    const version = 1;
    const recordType = `penunjang_${jenis}`;
    
    const result = await blockchainService.storeHash(
      recordId,
      dataHash,
      recordType,
      patientId,
      userId,
      version
    );
    
    if (result.success) {
      // Konversi BigInt ke Number/string untuk menghindari error
      const blockNumber = result.blockNumber !== undefined && result.blockNumber !== null
        ? Number(result.blockNumber)
        : null;
      
      const { error: updateError } = await supabase
        .from('penunjang')
        .update({
          blockchain_tx_hash: result.transactionHash,
          blockchain_block_number: blockNumber,
          blockchain_verified: true
        })
        .eq('id', id);
      
      if (updateError) {
        console.error('Failed to update record:', updateError);
      } else {
        console.log(`✅ Penunjang ${id} verified on blockchain`);
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
// CREATE - Buat permintaan penunjang baru
// ============================================
const createPenunjang = async (req, res) => {
  try {
    const {
      patient_id,
      admisi_id,
      no_registrasi,
      jenis,
      data_klinis,
      pemeriksaan_list,
      catatan,
      notes
    } = req.body;
    
    const userId = req.user?.id;
    
    console.log('📝 Creating penunjang request...');
    console.log('Patient ID:', patient_id);
    console.log('Jenis:', jenis);
    console.log('Pemeriksaan:', pemeriksaan_list);
    
    // Validasi required fields
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID wajib diisi'
      });
    }
    
    if (!jenis || (jenis !== 'laboratorium' && jenis !== 'radiologi')) {
      return res.status(400).json({
        success: false,
        message: 'Jenis penunjang harus laboratorium atau radiologi'
      });
    }
    
    if (!pemeriksaan_list || pemeriksaan_list.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Minimal satu pemeriksaan harus dipilih'
      });
    }
    
    // Generate hash dari data
    const dataForHash = {
      patient_id,
      jenis,
      pemeriksaan_list,
      data_klinis,
      catatan,
      created_at: new Date().toISOString()
    };
    const dataHash = generateDataHash(dataForHash);
    
    // Data yang akan disimpan
    const penunjangData = {
      patient_id,
      admisi_id: admisi_id || null,
      no_registrasi: no_registrasi || null,
      jenis,
      data_klinis: data_klinis || null,
      pemeriksaan_list,
      catatan: catatan || {},
      hasil_pemeriksaan: {},
      status: 'requested',
      requested_by: userId,
      requested_at: new Date().toISOString(),
      data_hash: dataHash,
      blockchain_verified: false,
      created_by: userId,
      notes: notes || null,
      created_at: new Date().toISOString()
    };
    
    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('penunjang')
      .insert([penunjangData])
      .select();
    
    if (error) {
      console.error('DB Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan data: ' + error.message
      });
    }
    
    console.log('✅ Penunjang saved to Supabase');
    console.log('Saved record ID:', data[0]?.id);
    
    // Kirim response awal ke frontend
    res.status(201).json({
      success: true,
      message: `Permintaan ${jenis === 'laboratorium' ? 'Laboratorium' : 'Radiologi'} berhasil disimpan`,
      data: data[0],
      blockchainStatus: 'pending'
    });
    
    // Proses blockchain di BACKGROUND (tidak nge-block response)
    setImmediate(() => {
      processBlockchainVerification(data[0].id, patient_id, dataHash, jenis, pemeriksaan_list);
    });
    
  } catch (error) {
    console.error('Create penunjang error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// READ - Ambil semua penunjang
// ============================================
const getAllPenunjang = async (req, res) => {
  try {
    const { patient_id, jenis, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('penunjang')
      .select(`
        *,
        pasien:patient_id (
          id,
          name,
          nik,
          no_rm
        ),
        requested_by_profile:requested_by (
          id,
          user_id,
          name
        ),
        completed_by_profile:completed_by (
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
    
    if (jenis && (jenis === 'laboratorium' || jenis === 'radiologi')) {
      query = query.eq('jenis', jenis);
    }
    
    if (status) {
      query = query.eq('status', status);
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
    console.error('Get all penunjang error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// READ - Ambil penunjang berdasarkan ID
// ============================================
const getPenunjangById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('penunjang')
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
        requested_by_profile:requested_by (
          id,
          user_id,
          name
        ),
        completed_by_profile:completed_by (
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
          message: 'Data penunjang tidak ditemukan'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get penunjang by id error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE - Update hasil pemeriksaan
// ============================================
const updateHasilPenunjang = async (req, res) => {
  try {
    const { id } = req.params;
    const { hasil_pemeriksaan, kesimpulan, rekomendasi, catatan, notes } = req.body;
    const userId = req.user?.id;
    
    const { data: existingData, error: findError } = await supabase
      .from('penunjang')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'Data penunjang tidak ditemukan'
      });
    }
    
    const updateData = {
      hasil_pemeriksaan: hasil_pemeriksaan || existingData.hasil_pemeriksaan,
      kesimpulan: kesimpulan || existingData.kesimpulan,
      rekomendasi: rekomendasi || existingData.rekomendasi,
      catatan: catatan || existingData.catatan,
      notes: notes || existingData.notes,
      status: 'completed',
      completed_by: userId,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const dataForHash = {
      patient_id: existingData.patient_id,
      jenis: existingData.jenis,
      pemeriksaan_list: existingData.pemeriksaan_list,
      hasil_pemeriksaan: updateData.hasil_pemeriksaan,
      kesimpulan: updateData.kesimpulan,
      updated_at: new Date().toISOString()
    };
    updateData.data_hash = generateDataHash(dataForHash);
    
    const { data, error } = await supabase
      .from('penunjang')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    console.log('✅ Penunjang hasil updated');
    
    res.json({
      success: true,
      message: 'Hasil pemeriksaan berhasil disimpan',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Update hasil penunjang error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE - Update status penunjang
// ============================================
const updateStatusPenunjang = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancel_reason } = req.body;
    const userId = req.user?.id;
    
    const validStatus = ['draft', 'requested', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }
    
    const updateData = {
      status: status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updateData.completed_by = userId;
      updateData.completed_at = new Date().toISOString();
    }
    
    if (status === 'cancelled' && cancel_reason) {
      updateData.notes = cancel_reason;
    }
    
    const { data, error } = await supabase
      .from('penunjang')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: `Status berhasil diubah menjadi ${status}`,
      data: data[0]
    });
    
  } catch (error) {
    console.error('Update status penunjang error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// DELETE - Hapus penunjang
// ============================================
const deletePenunjang = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: existingData, error: findError } = await supabase
      .from('penunjang')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'Data penunjang tidak ditemukan'
      });
    }
    
    const { error } = await supabase
      .from('penunjang')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Data penunjang berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete penunjang error:', error);
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
      .from('penunjang')
      .update({
        blockchain_tx_hash: blockchain_tx_hash,
        blockchain_block_number: blockchain_block_number,
        blockchain_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    console.log(`✅ Blockchain status updated for penunjang ${id}`);
    
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
  createPenunjang,
  getAllPenunjang,
  getPenunjangById,
  updateHasilPenunjang,
  updateStatusPenunjang,
  deletePenunjang,
  updateBlockchainStatus
};