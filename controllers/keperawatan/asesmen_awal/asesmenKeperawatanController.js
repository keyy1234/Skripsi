// backend/src/controllers/keperawatan/asesmen_awal/asesmenKeperawatanController.js

const { supabase } = require('../../../config/supabase');
const crypto = require('crypto');
const blockchainService = require('../../../services/blockchainService');

// Generate hash dari data
const generateDataHash = (data) => {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(sortedData).digest('hex');
};

// Proses blockchain di background dan update semua tabel
const processBlockchainVerification = async (combinedData, patientId, savedRecords) => {
  try {
    console.log(`🔄 Processing blockchain verification for all asesmen keperawatan...`);
    
    // Generate SATU hash untuk SEMUA data
    const allDataHash = generateDataHash(combinedData);
    const recordId = `asesmen_keperawatan_${patientId}_${Date.now()}`;
    const userId = 'system';
    const version = 1;
    
    console.log(`📦 Combined data hash: ${allDataHash.substring(0, 20)}...`);
    
    const result = await blockchainService.storeHash(
      recordId,
      allDataHash,
      'asesmen_keperawatan',
      patientId,
      userId,
      version
    );
    
    if (result.success) {
      const blockNumber = Number(result.blockNumber);
      const txHash = result.transactionHash;
      
      console.log(`✅ Blockchain transaction completed: ${txHash}`);
      console.log(`   Block: ${blockNumber}`);
      
      // ============================================
      // UPDATE SEMUA TABEL DENGAN TX HASH YANG SAMA
      // ============================================
      
      // Update tabel anamnesis
      if (savedRecords.anamnesis?.id) {
        await supabase
          .from('anamnesis')
          .update({
            blockchain_tx_hash: txHash,
            blockchain_block_number: blockNumber,
            blockchain_verified: true,
            data_hash: allDataHash
          })
          .eq('id', savedRecords.anamnesis.id);
        console.log(`✅ Updated anamnesis with tx hash`);
      }
      
      // Update tabel pemeriksaan
      if (savedRecords.pemeriksaan?.id) {
        await supabase
          .from('pemeriksaan')
          .update({
            blockchain_tx_hash: txHash,
            blockchain_block_number: blockNumber,
            blockchain_verified: true,
            data_hash: allDataHash
          })
          .eq('id', savedRecords.pemeriksaan.id);
        console.log(`✅ Updated pemeriksaan with tx hash`);
      }
      
      // Update tabel status_fungsional
      if (savedRecords.status_fungsional?.id) {
        await supabase
          .from('status_fungsional')
          .update({
            blockchain_tx_hash: txHash,
            blockchain_block_number: blockNumber,
            blockchain_verified: true,
            data_hash: allDataHash
          })
          .eq('id', savedRecords.status_fungsional.id);
        console.log(`✅ Updated status_fungsional with tx hash`);
      }
      
      // Update tabel asesmen_resiko_jatuh
      if (savedRecords.resiko_jatuh?.id) {
        await supabase
          .from('asesmen_resiko_jatuh')
          .update({
            blockchain_tx_hash: txHash,
            blockchain_block_number: blockNumber,
            blockchain_verified: true,
            data_hash: allDataHash
          })
          .eq('id', savedRecords.resiko_jatuh.id);
        console.log(`✅ Updated asesmen_resiko_jatuh with tx hash`);
      }
      
      // Update tabel cppt_keperawatan
      if (savedRecords.cppt?.id) {
        await supabase
          .from('cppt_keperawatan')
          .update({
            blockchain_tx_hash: txHash,
            blockchain_block_number: blockNumber,
            blockchain_verified: true,
            data_hash: allDataHash
          })
          .eq('id', savedRecords.cppt.id);
        console.log(`✅ Updated cppt_keperawatan with tx hash`);
      }
      
      console.log(`✅ All asesmen keperawatan verified on blockchain`);
      console.log(`   Tx Hash: ${txHash}`);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Blockchain verification failed:', error);
    return false;
  }
};

// SAVE ALL - Simpan semua asesmen sekaligus
const saveAllAsesmen = async (req, res) => {
  try {
    const {
      patient_id,
      admisi_id,
      no_registrasi,
      no_rm,
      anamnesis,
      pemeriksaan,
      status_fungsional,
      resiko_jatuh,
      cppt
    } = req.body;
    
    const userId = req.user?.id;
    
    console.log('📝 Saving all asesmen keperawatan...');
    console.log('Patient ID:', patient_id);
    
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID wajib diisi'
      });
    }
    
    const savedRecords = {};
    const errors = [];
    
    // Data untuk blockchain (SATU hash untuk semua)
    const combinedDataForBlockchain = {
      patient_id,
      anamnesis,
      pemeriksaan,
      status_fungsional,
      resiko_jatuh,
      cppt,
      saved_at: new Date().toISOString()
    };
    
    // ============================================
    // 1. SIMPAN ANAMNESIS
    // ============================================
    if (anamnesis) {
      const anamnesisData = {
        patient_id,
        admisi_id: admisi_id || null,
        no_registrasi: no_registrasi || null,
        no_rm: no_rm || null,
        keluhan_utama: anamnesis.keluhan_utama,
        riwayat_penyakit_pasien_list: anamnesis.riwayat_penyakit_pasien_list || [],
        riwayat_penyakit_pasien_keterangan: anamnesis.riwayat_penyakit_pasien_keterangan,
        riwayat_penyakit_keluarga_list: anamnesis.riwayat_penyakit_keluarga_list || [],
        riwayat_penyakit_keluarga_keterangan: anamnesis.riwayat_penyakit_keluarga_keterangan,
        alergi_makanan: anamnesis.alergi_makanan || [],
        alergi_obat: anamnesis.alergi_obat || [],
        cara_masuk: anamnesis.cara_masuk,
        kondisi_masuk: anamnesis.kondisi_masuk,
        sumber_informasi: anamnesis.sumber_informasi,
        bahasa: anamnesis.bahasa,
        hambatan_komunikasi: anamnesis.hambatan_komunikasi,
        catatan_tambahan: anamnesis.catatan_tambahan,
        status: 'completed',
        created_by: userId,
        created_at: new Date().toISOString(),
        blockchain_verified: false  // Awalnya false
      };
      
      const { data, error } = await supabase
        .from('anamnesis')
        .insert([anamnesisData])
        .select();
      
      if (error) {
        errors.push({ table: 'anamnesis', error: error.message });
      } else {
        savedRecords.anamnesis = data[0];
        console.log(`✅ Anamnesis saved: ${data[0].id}`);
      }
    }
    
    // ============================================
    // 2. SIMPAN PEMERIKSAAN
    // ============================================
    if (pemeriksaan) {
      const gcsTotal = (pemeriksaan.gcs?.e || 0) + (pemeriksaan.gcs?.v || 0) + (pemeriksaan.gcs?.m || 0);
      let gcsLabel = 'Compos Mentis';
      if (gcsTotal >= 14) gcsLabel = 'Compos Mentis';
      else if (gcsTotal >= 9) gcsLabel = 'Somnolen';
      else if (gcsTotal >= 6) gcsLabel = 'Stupor';
      else gcsLabel = 'Koma';
      
      const pemeriksaanData = {
        patient_id,
        admisi_id: admisi_id || null,
        no_registrasi: no_registrasi || null,
        no_rm: no_rm || null,
        gcs_e: pemeriksaan.gcs?.e,
        gcs_v: pemeriksaan.gcs?.v,
        gcs_m: pemeriksaan.gcs?.m,
        gcs_total: gcsTotal,
        gcs_label: gcsLabel,
        nadi: pemeriksaan.ttv?.nadi,
        suhu: pemeriksaan.ttv?.suhu,
        nafas: pemeriksaan.ttv?.nafas,
        tekanan_darah_sistolik: pemeriksaan.ttv?.sistolik,
        tekanan_darah_diastolik: pemeriksaan.ttv?.diastolik,
        spo2: pemeriksaan.ttv?.spo2,
        berat_badan: pemeriksaan.ttv?.beratBadan,
        tinggi_badan: pemeriksaan.ttv?.tinggiBadan,
        pemeriksaan_fisik: pemeriksaan.pemeriksaan_fisik || {},
        catatan_pemeriksaan_fisik: pemeriksaan.catatan_fisik || {},
        status: 'completed',
        created_by: userId,
        created_at: new Date().toISOString(),
        blockchain_verified: false
      };
      
      const { data, error } = await supabase
        .from('pemeriksaan')
        .insert([pemeriksaanData])
        .select();
      
      if (error) {
        errors.push({ table: 'pemeriksaan', error: error.message });
      } else {
        savedRecords.pemeriksaan = data[0];
        console.log(`✅ Pemeriksaan saved: ${data[0].id}`);
      }
    }
    
    // ============================================
    // 3. SIMPAN STATUS FUNGSIONAL
    // ============================================
    if (status_fungsional) {
      const totalSkor = Object.values(status_fungsional.items || {}).reduce((sum, item) => sum + (item?.value || 0), 0);
      let tingkatKetergantungan = 'Mandiri';
      if (totalSkor >= 20) tingkatKetergantungan = 'Mandiri';
      else if (totalSkor >= 15) tingkatKetergantungan = 'Ketergantungan Ringan';
      else if (totalSkor >= 10) tingkatKetergantungan = 'Ketergantungan Sedang';
      else if (totalSkor >= 5) tingkatKetergantungan = 'Ketergantungan Berat';
      else tingkatKetergantungan = 'Ketergantungan Total';
      
      const statusFungsionalData = {
        patient_id,
        admisi_id: admisi_id || null,
        no_registrasi: no_registrasi || null,
        no_rm: no_rm || null,
        bowel_value: status_fungsional.items?.bowel?.value || 0,
        bowel_label: status_fungsional.items?.bowel?.label,
        bladder_value: status_fungsional.items?.bladder?.value || 0,
        bladder_label: status_fungsional.items?.bladder?.label,
        grooming_value: status_fungsional.items?.grooming?.value || 0,
        grooming_label: status_fungsional.items?.grooming?.label,
        toilet_value: status_fungsional.items?.toilet?.value || 0,
        toilet_label: status_fungsional.items?.toilet?.label,
        feeding_value: status_fungsional.items?.feeding?.value || 0,
        feeding_label: status_fungsional.items?.feeding?.label,
        transfer_value: status_fungsional.items?.transfer?.value || 0,
        transfer_label: status_fungsional.items?.transfer?.label,
        mobility_value: status_fungsional.items?.mobility?.value || 0,
        mobility_label: status_fungsional.items?.mobility?.label,
        dressing_value: status_fungsional.items?.dressing?.value || 0,
        dressing_label: status_fungsional.items?.dressing?.label,
        stairs_value: status_fungsional.items?.stairs?.value || 0,
        stairs_label: status_fungsional.items?.stairs?.label,
        bathing_value: status_fungsional.items?.bathing?.value || 0,
        bathing_label: status_fungsional.items?.bathing?.label,
        total_skor: totalSkor,
        tingkat_ketergantungan: tingkatKetergantungan,
        barthel_data: status_fungsional.items || {},
        status: 'completed',
        created_by: userId,
        created_at: new Date().toISOString(),
        blockchain_verified: false
      };
      
      const { data, error } = await supabase
        .from('status_fungsional')
        .insert([statusFungsionalData])
        .select();
      
      if (error) {
        errors.push({ table: 'status_fungsional', error: error.message });
      } else {
        savedRecords.status_fungsional = data[0];
        console.log(`✅ Status Fungsional saved: ${data[0].id}`);
      }
    }
    
    // ============================================
    // 4. SIMPAN ASESMEN RESIKO JATUH
    // ============================================
    if (resiko_jatuh) {
      const resikoJatuhData = {
        patient_id,
        admisi_id: admisi_id || null,
        no_registrasi: no_registrasi || null,
        no_rm: no_rm || null,
        jenis_skala: resiko_jatuh.jenis_skala,
        detail_data: resiko_jatuh.details || {},
        status: 'completed',
        created_by: userId,
        created_at: new Date().toISOString(),
        blockchain_verified: false
      };
      
      if (resiko_jatuh.jenis_skala === 'humpty_dumpty') {
        resikoJatuhData.humpty_total_skor = resiko_jatuh.total_skor;
        resikoJatuhData.humpty_tingkat_resiko = resiko_jatuh.tingkat_resiko;
      } else if (resiko_jatuh.jenis_skala === 'hendrich_ii') {
        resikoJatuhData.hendrich_total_skor = resiko_jatuh.total_skor;
        resikoJatuhData.hendrich_tingkat_resiko = resiko_jatuh.tingkat_resiko;
      } else if (resiko_jatuh.jenis_skala === 'morse') {
        resikoJatuhData.morse_total_skor = resiko_jatuh.total_skor;
        resikoJatuhData.morse_tingkat_resiko = resiko_jatuh.tingkat_resiko;
      }
      
      const { data, error } = await supabase
        .from('asesmen_resiko_jatuh')
        .insert([resikoJatuhData])
        .select();
      
      if (error) {
        errors.push({ table: 'asesmen_resiko_jatuh', error: error.message });
      } else {
        savedRecords.resiko_jatuh = data[0];
        console.log(`✅ Resiko Jatuh saved: ${data[0].id}`);
      }
    }
    
    // ============================================
    // 5. SIMPAN CPPT KEPERAWATAN
    // ============================================
    if (cppt) {
      const cpptData = {
        patient_id,
        admisi_id: admisi_id || null,
        no_registrasi: no_registrasi || null,
        no_rm: no_rm || null,
        subjective: cppt.subjective,
        objective: typeof cppt.objective === 'string' ? cppt.objective : JSON.stringify(cppt.objective),
        assessment: cppt.assessment,
        planning: cppt.planning,
        instruksi_ppa: cppt.instruksiPPA,
        keadaan_umum: cppt.objective?.ku,
        gcs_e: cppt.objective?.gcs?.toString().charAt(0),
        gcs_v: cppt.objective?.gcs?.toString().charAt(1),
        gcs_m: cppt.objective?.gcs?.toString().charAt(2),
        gcs_total: parseInt(cppt.objective?.gcs) || 15,
        gcs_label: cppt.objective?.gcsLabel,
        nadi: cppt.objective?.nadi,
        tekanan_darah_sistolik: cppt.objective?.tdSistolik,
        tekanan_darah_diastolik: cppt.objective?.tdDiastolik,
        suhu: cppt.objective?.suhu,
        respirasi_rate: cppt.objective?.rr,
        spo2: cppt.objective?.spo2,
        tinggi_badan: cppt.objective?.tb,
        berat_badan: cppt.objective?.bb,
        tanggal_catat: cppt.tanggal || new Date().toISOString(),
        perawat_nama: cppt.dibuatOleh,
        status: 'completed',
        created_by: userId,
        created_at: new Date().toISOString(),
        blockchain_verified: false
      };
      
      const { data, error } = await supabase
        .from('cppt_keperawatan')
        .insert([cpptData])
        .select();
      
      if (error) {
        errors.push({ table: 'cppt_keperawatan', error: error.message });
      } else {
        savedRecords.cppt = data[0];
        console.log(`✅ CPPT saved: ${data[0].id}`);
      }
    }
    
    // Kirim response awal
    res.status(200).json({
      success: true,
      message: 'Semua data asesmen keperawatan berhasil disimpan!',
      data: savedRecords,
      blockchainStatus: 'pending'
    });
    
    // ============================================
    // PROSES BLOCKCHAIN - Update tx hash ke semua tabel
    // ============================================
    if (Object.keys(savedRecords).length > 0) {
      setImmediate(() => {
        processBlockchainVerification(combinedDataForBlockchain, patient_id, savedRecords);
      });
    }
    
  } catch (error) {
    console.error('Save all asesmen error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// GET ALL - Ambil semua asesmen berdasarkan patient
// ============================================
const getAllAsesmenByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID wajib diisi'
      });
    }
    
    const [anamnesis, pemeriksaan, statusFungsional, resikoJatuh, cppt] = await Promise.all([
      supabase.from('anamnesis').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
      supabase.from('pemeriksaan').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
      supabase.from('status_fungsional').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
      supabase.from('asesmen_resiko_jatuh').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
      supabase.from('cppt_keperawatan').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1)
    ]);
    
    res.json({
      success: true,
      data: {
        anamnesis: anamnesis.data?.[0] || null,
        pemeriksaan: pemeriksaan.data?.[0] || null,
        status_fungsional: statusFungsional.data?.[0] || null,
        resiko_jatuh: resikoJatuh.data?.[0] || null,
        cppt: cppt.data?.[0] || null
      }
    });
    
  } catch (error) {
    console.error('Get all asesmen error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  saveAllAsesmen,
  getAllAsesmenByPatient
};