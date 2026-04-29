const { supabase } = require('../../config/supabase');
const crypto = require('crypto');
const blockchainService = require('../../services/blockchainService');

// Generate hash dari data
const generateDataHash = (data) => {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(sortedData).digest('hex');
};

// Hitung EWS (Early Warning Score)
const calculateEWS = (data) => {
  let score = 0;
  // Sistolik
  if (data.tekanan_darah_sistolik <= 70) score += 3;
  else if (data.tekanan_darah_sistolik <= 80) score += 2;
  else if (data.tekanan_darah_sistolik <= 100) score += 1;
  else if (data.tekanan_darah_sistolik >= 200) score += 2;
  // Nadi
  if (data.nadi <= 40) score += 3;
  else if (data.nadi <= 50) score += 2;
  else if (data.nadi <= 60) score += 1;
  else if (data.nadi >= 131) score += 3;
  else if (data.nadi >= 111) score += 2;
  else if (data.nadi >= 91) score += 1;
  // Suhu
  if (data.suhu <= 35) score += 3;
  else if (data.suhu >= 39) score += 2;
  // Nafas
  if (data.nafas <= 8) score += 3;
  else if (data.nafas <= 11) score += 1;
  else if (data.nafas >= 25) score += 2;
  else if (data.nafas >= 21) score += 1;
  // Saturasi Oksigen
  if (data.spo2 <= 91) score += 3;
  else if (data.spo2 <= 93) score += 2;
  else if (data.spo2 <= 95) score += 1;
  // Skala Nyeri
  if (data.skala_nyeri >= 8) score += 2;
  else if (data.skala_nyeri >= 5) score += 1;
  
  return score;
};

// Proses blockchain di background
const processBlockchainVerification = async (id, patientId, dataHash) => {
  try {
    console.log(`🔄 Processing blockchain verification for observasi ${id}...`);
    
    const recordId = `observasi_${id}_${Date.now()}`;
    const userId = 'system';
    const version = 1;
    
    const result = await blockchainService.storeHash(
      recordId, dataHash, 'observasi_pasien', patientId, userId, version
    );
    
    if (result.success) {
      const blockNumber = Number(result.blockNumber);
      await supabase.from('observasi_pasien').update({
        blockchain_tx_hash: result.transactionHash,
        blockchain_block_number: blockNumber,
        blockchain_verified: true
      }).eq('id', id);
      console.log(`✅ Observasi ${id} verified on blockchain`);
    }
  } catch (error) {
    console.error('Blockchain verification failed:', error);
  }
};

// ============================================
// CREATE - Simpan observasi pasien
// ============================================
const createObservasi = async (req, res) => {
  try {
    const {
      patient_id,
      admisi_id,
      no_registrasi,
      no_rm,
      tanggal_observasi,
      jam_observasi,
      tekanan_darah_sistolik,
      tekanan_darah_diastolik,
      nadi,
      suhu,
      nafas,
      spo2,
      skala_nyeri,
      berat_badan,
      tinggi_badan,
      lingkar_kepala,
      gcs_e,
      gcs_v,
      gcs_m,
      perawat_nama,
      perawat_nip,
      catatan,
      notes
    } = req.body;
    
    const userId = req.user?.id;
    
    console.log('📝 Creating observasi pasien...');
    console.log('Patient ID:', patient_id);
    console.log('Tanggal:', tanggal_observasi, 'Jam:', jam_observasi);
    
    // Validasi required fields
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID wajib diisi'
      });
    }
    
    if (!tanggal_observasi || !jam_observasi) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal dan jam observasi wajib diisi'
      });
    }
    
    // Hitung GCS total
    const gcsTotal = (gcs_e || 0) + (gcs_v || 0) + (gcs_m || 0);
    
    // Hitung EWS
    const observasiDataForEWS = {
      tekanan_darah_sistolik,
      nadi,
      suhu,
      nafas,
      spo2,
      skala_nyeri
    };
    const ews = calculateEWS(observasiDataForEWS);
    
    // Generate hash
    const dataForHash = {
      patient_id,
      tanggal_observasi,
      jam_observasi,
      tekanan_darah_sistolik,
      tekanan_darah_diastolik,
      nadi,
      suhu,
      nafas,
      spo2,
      skala_nyeri,
      ews,
      created_at: new Date().toISOString()
    };
    const dataHash = generateDataHash(dataForHash);
    
    // Data yang akan disimpan
    const observasiData = {
      patient_id,
      admisi_id: admisi_id || null,
      no_registrasi: no_registrasi || null,
      no_rm: no_rm || null,
      tanggal_observasi,
      jam_observasi,
      tekanan_darah_sistolik: tekanan_darah_sistolik || null,
      tekanan_darah_diastolik: tekanan_darah_diastolik || null,
      nadi: nadi || null,
      suhu: suhu || null,
      nafas: nafas || null,
      spo2: spo2 || null,
      skala_nyeri: skala_nyeri || null,
      berat_badan: berat_badan || null,
      tinggi_badan: tinggi_badan || null,
      lingkar_kepala: lingkar_kepala || null,
      gcs_e: gcs_e || null,
      gcs_v: gcs_v || null,
      gcs_m: gcs_m || null,
      gcs_total: gcsTotal > 0 ? gcsTotal : null,
      ews: ews,
      perawat_nama: perawat_nama || null,
      perawat_nip: perawat_nip || null,
      catatan: catatan || null,
      status: 'completed',
      data_hash: dataHash,
      blockchain_verified: false,
      created_by: userId,
      notes: notes || null,
      created_at: new Date().toISOString()
    };
    
    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('observasi_pasien')
      .insert([observasiData])
      .select();
    
    if (error) {
      console.error('DB Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan data: ' + error.message
      });
    }
    
    console.log('✅ Observasi saved to Supabase');
    console.log('Saved record ID:', data[0]?.id);
    console.log('EWS Score:', ews);
    
    // Kirim response awal ke frontend
    res.status(201).json({
      success: true,
      message: 'Observasi pasien berhasil disimpan',
      data: data[0],
      ews: ews,
      blockchainStatus: 'pending'
    });
    
    // Proses blockchain di BACKGROUND
    setImmediate(() => {
      processBlockchainVerification(data[0].id, patient_id, dataHash);
    });
    
  } catch (error) {
    console.error('Create observasi error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// READ - Ambil semua observasi
// ============================================
const getAllObservasi = async (req, res) => {
  try {
    const { patient_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('observasi_pasien')
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
      .order('tanggal_observasi', { ascending: false })
      .order('jam_observasi', { ascending: false })
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
    console.error('Get all observasi error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: []
    });
  }
};

// ============================================
// READ - Ambil observasi berdasarkan ID
// ============================================
const getObservasiById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('observasi_pasien')
      .select(`
        *,
        pasien:patient_id (
          id,
          name,
          nik,
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
          message: 'Observasi tidak ditemukan'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get observasi by id error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE - Update observasi
// ============================================
const updateObservasi = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    
    // Recalculate EWS if TTV data changed
    if (updateData.tekanan_darah_sistolik || updateData.nadi || updateData.suhu || updateData.nafas || updateData.spo2 || updateData.skala_nyeri) {
      const ews = calculateEWS(updateData);
      updateData.ews = ews;
    }
    
    const { data, error } = await supabase
      .from('observasi_pasien')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Observasi berhasil diupdate',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Update observasi error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// DELETE - Hapus observasi
// ============================================
const deleteObservasi = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('observasi_pasien')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Observasi berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete observasi error:', error);
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
      .from('observasi_pasien')
      .update({
        blockchain_tx_hash: blockchain_tx_hash,
        blockchain_block_number: blockchain_block_number,
        blockchain_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    console.log(`✅ Blockchain status updated for observasi ${id}`);
    
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

// ============================================
// GET - Ambil data untuk grafik TTV
// ============================================
const getGrafikTTV = async (req, res) => {
  try {
    const { patient_id, days = 7 } = req.query;
    
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID wajib diisi'
      });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('observasi_pasien')
      .select('tanggal_observasi, jam_observasi, tekanan_darah_sistolik, tekanan_darah_diastolik, nadi, suhu, nafas, spo2, ews')
      .eq('patient_id', patient_id)
      .gte('tanggal_observasi', startDate.toISOString().split('T')[0])
      .order('tanggal_observasi', { ascending: true })
      .order('jam_observasi', { ascending: true });
    
    if (error) throw error;
    
    const formattedData = data.map(item => ({
      waktu: `${item.tanggal_observasi.substring(5)} ${item.jam_observasi.substring(0,5)}`,
      sistolik: item.tekanan_darah_sistolik,
      diastolik: item.tekanan_darah_diastolik,
      nadi: item.nadi,
      suhu: item.suhu,
      nafas: item.nafas,
      spo2: item.spo2,
      ews: item.ews
    }));
    
    res.json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error('Get grafik TTV error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createObservasi,
  getAllObservasi,
  getObservasiById,
  updateObservasi,
  deleteObservasi,
  updateBlockchainStatus,
  getGrafikTTV
};