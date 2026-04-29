const { supabase } = require('../../../config/supabase');

/**
 * Helper function to generate objective text from TTV data
 */
const generateObjectiveFromTTV = (ttv, measurementTime = null) => {
  const parts = [];
  
  if (ttv.systolic && ttv.diastolic) {
    parts.push(`TD: ${ttv.systolic}/${ttv.diastolic} mmHg`);
  }
  if (ttv.heart_rate) {
    parts.push(`Nadi: ${ttv.heart_rate} x/menit`);
  }
  if (ttv.respiratory_rate) {
    parts.push(`Napas: ${ttv.respiratory_rate} x/menit`);
  }
  if (ttv.temperature) {
    parts.push(`Suhu: ${ttv.temperature}°C`);
  }
  if (ttv.spo2) {
    parts.push(`SpO2: ${ttv.spo2}%`);
  }
  if (ttv.weight) {
    parts.push(`BB: ${ttv.weight} kg`);
  }
  if (ttv.height) {
    parts.push(`TB: ${ttv.height} cm`);
  }
  if (ttv.bmi) {
    parts.push(`BMI: ${ttv.bmi}`);
  }
  
  if (parts.length === 0) return '';
  
  let result = `**TTV:** ${parts.join(', ')}`;
  
  if (measurementTime) {
    const formattedTime = new Date(measurementTime).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    result += `\n*(Diukur pada: ${formattedTime})*`;
  }
  
  return result;
};

/**
 * Update SOAP Objective dengan data TTV terbaru
 */
const updateSoapObjective = async (encounterId, ttvData, createdBy) => {
  try {
    const objectiveText = generateObjectiveFromTTV(ttvData, new Date());
    
    if (!objectiveText) return;
    
    // Cek apakah ada draft SOAP
    const { data: existingSoap, error: findError } = await supabase
      .from('soap_notes')
      .select('*')
      .eq('encounter_id', encounterId)
      .eq('status', 'draft')
      .order('note_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (findError) throw findError;
    
    if (existingSoap) {
      // Update existing draft SOAP
      const updatedObjective = existingSoap.objective 
        ? `${existingSoap.objective}\n\n${objectiveText}`
        : objectiveText;
      
      await supabase
        .from('soap_notes')
        .update({
          objective: updatedObjective,
          updated_at: new Date()
        })
        .eq('soap_note_id', existingSoap.soap_note_id);
      
      console.log('✅ SOAP Objective updated for encounter:', encounterId);
    } else {
      // Create new draft SOAP with objective
      await supabase
        .from('soap_notes')
        .insert([{
          encounter_id: encounterId,
          objective: objectiveText,
          status: 'draft',
          created_by: createdBy || 1
        }]);
      
      console.log('✅ New draft SOAP created for encounter:', encounterId);
    }
  } catch (error) {
    console.error('Update SOAP Objective error:', error);
    // Don't throw - SOAP update is non-critical
  }
};

/**
 * Get all TTV records for an encounter
 */
const getTTVByEncounter = async (req, res) => {
  try {
    const { encounterId } = req.params;
    
    if (!encounterId) {
      return res.status(400).json({
        success: false,
        message: 'encounterId diperlukan'
      });
    }
    
    const { data, error } = await supabase
      .from('vital_signs')
      .select('*')
      .eq('encounter_id', parseInt(encounterId))
      .order('measurement_time', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
    
  } catch (error) {
    console.error('Get TTV error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data TTV',
      error: error.message
    });
  }
};

/**
 * Get single TTV record
 */
const getTTVById = async (req, res) => {
  try {
    const { ttvId } = req.params;
    
    const { data, error } = await supabase
      .from('vital_signs')
      .select('*')
      .eq('vital_signs_id', parseInt(ttvId))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Data TTV tidak ditemukan'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get TTV by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data TTV',
      error: error.message
    });
  }
};

/**
 * Create new TTV record
 */
const createTTV = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const { 
      systolic, diastolic, heart_rate, respiratory_rate, 
      temperature, spo2, weight, height, created_by 
    } = req.body;
    
    console.log('📝 [TTV] Create request for encounter:', encounterId);
    console.log('📊 [TTV] Data:', { systolic, diastolic, heart_rate, temperature });
    
    // Validasi minimal
    if (!systolic && !diastolic && !heart_rate && !temperature && !spo2) {
      return res.status(400).json({
        success: false,
        message: 'Isi minimal satu tanda vital'
      });
    }
    
    // Buat vital_sign_data JSONB
    const vitalSignData = {
      systolic: systolic ? parseInt(systolic) : null,
      diastolic: diastolic ? parseInt(diastolic) : null,
      heart_rate: heart_rate ? parseInt(heart_rate) : null,
      respiratory_rate: respiratory_rate ? parseInt(respiratory_rate) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      spo2: spo2 ? parseInt(spo2) : null,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null
    };
    
    // Hitung BMI jika ada berat dan tinggi
    if (vitalSignData.weight && vitalSignData.height) {
      const heightInMeters = vitalSignData.height / 100;
      vitalSignData.bmi = parseFloat(
        (vitalSignData.weight / (heightInMeters * heightInMeters)).toFixed(1)
      );
    }
    
    console.log('📦 [TTV] vitalSignData:', vitalSignData);
    
    // Insert TTV
    const { data: ttvData, error: ttvError } = await supabase
      .from('vital_signs')
      .insert([{
        encounter_id: parseInt(encounterId),
        vital_sign_data: vitalSignData,
        created_by: created_by || 1,
        measurement_time: new Date()
      }])
      .select()
      .single();
    
    if (ttvError) {
      console.error('❌ [TTV] Supabase insert error:', ttvError);
      return res.status(500).json({
        success: false,
        message: 'Database error: ' + ttvError.message,
        details: ttvError
      });
    }
    
    console.log('✅ [TTV] Saved successfully, ID:', ttvData.vital_signs_id);
    
    // Update SOAP Objective (non-critical)
    try {
      await updateSoapObjective(
        parseInt(encounterId), 
        vitalSignData, 
        created_by || 1
      );
      console.log('✅ [TTV] SOAP Objective updated');
    } catch (soapError) {
      console.warn('⚠️ [TTV] SOAP update failed (non-critical):', soapError.message);
    }
    
    res.json({
      success: true,
      message: 'Data TTV berhasil disimpan dan SOAP Objective diperbarui',
      data: ttvData
    });
    
  } catch (error) {
    console.error('❌ [TTV] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data TTV: ' + error.message,
      error: error.message
    });
  }
};

/**
 * Update TTV record
 */
const updateTTV = async (req, res) => {
  try {
    const { ttvId } = req.params;
    const { 
      systolic, diastolic, heart_rate, respiratory_rate, 
      temperature, spo2, weight, height, updated_by 
    } = req.body;
    
    // Get existing TTV
    const { data: existingTTV, error: findError } = await supabase
      .from('vital_signs')
      .select('*')
      .eq('vital_signs_id', parseInt(ttvId))
      .single();
    
    if (findError) {
      if (findError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Data TTV tidak ditemukan'
        });
      }
      throw findError;
    }
    
    // Buat vital_sign_data JSONB yang diupdate
    const vitalSignData = {
      systolic: systolic !== undefined ? parseInt(systolic) : existingTTV.vital_sign_data?.systolic,
      diastolic: diastolic !== undefined ? parseInt(diastolic) : existingTTV.vital_sign_data?.diastolic,
      heart_rate: heart_rate !== undefined ? parseInt(heart_rate) : existingTTV.vital_sign_data?.heart_rate,
      respiratory_rate: respiratory_rate !== undefined ? parseInt(respiratory_rate) : existingTTV.vital_sign_data?.respiratory_rate,
      temperature: temperature !== undefined ? parseFloat(temperature) : existingTTV.vital_sign_data?.temperature,
      spo2: spo2 !== undefined ? parseInt(spo2) : existingTTV.vital_sign_data?.spo2,
      weight: weight !== undefined ? parseFloat(weight) : existingTTV.vital_sign_data?.weight,
      height: height !== undefined ? parseFloat(height) : existingTTV.vital_sign_data?.height
    };
    
    // Recalculate BMI
    if (vitalSignData.weight && vitalSignData.height) {
      const heightInMeters = vitalSignData.height / 100;
      vitalSignData.bmi = parseFloat(
        (vitalSignData.weight / (heightInMeters * heightInMeters)).toFixed(1)
      );
    } else {
      vitalSignData.bmi = existingTTV.vital_sign_data?.bmi;
    }
    
    const { data, error } = await supabase
      .from('vital_signs')
      .update({
        vital_sign_data: vitalSignData,
        updated_by: updated_by || 1,
        updated_at: new Date()
      })
      .eq('vital_signs_id', parseInt(ttvId))
      .select()
      .single();
    
    if (error) throw error;
    
    // Update SOAP Objective
    await updateSoapObjective(
      existingTTV.encounter_id,
      vitalSignData,
      updated_by || 1
    );
    
    res.json({
      success: true,
      message: 'Data TTV berhasil diupdate',
      data: data
    });
    
  } catch (error) {
    console.error('Update TTV error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data TTV',
      error: error.message
    });
  }
};

/**
 * Delete TTV record
 */
const deleteTTV = async (req, res) => {
  try {
    const { ttvId } = req.params;
    
    // Get encounter_id before delete
    const { data: ttv, error: findError } = await supabase
      .from('vital_signs')
      .select('encounter_id')
      .eq('vital_signs_id', parseInt(ttvId))
      .single();
    
    if (findError) {
      if (findError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Data TTV tidak ditemukan'
        });
      }
      throw findError;
    }
    
    const { error } = await supabase
      .from('vital_signs')
      .delete()
      .eq('vital_signs_id', parseInt(ttvId));
    
    if (error) throw error;
    
    // Get latest TTV after delete to update SOAP
    const { data: latestTTV } = await supabase
      .from('vital_signs')
      .select('vital_sign_data')
      .eq('encounter_id', ttv.encounter_id)
      .order('measurement_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (latestTTV) {
      await updateSoapObjective(
        ttv.encounter_id,
        latestTTV.vital_sign_data,
        1
      );
    }
    
    res.json({
      success: true,
      message: 'Data TTV berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete TTV error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data TTV',
      error: error.message
    });
  }
};

/**
 * Get latest TTV for an encounter
 */
const getLatestTTV = async (req, res) => {
  try {
    const { encounterId } = req.params;
    
    const { data, error } = await supabase
      .from('vital_signs')
      .select('*')
      .eq('encounter_id', parseInt(encounterId))
      .order('measurement_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || null
    });
    
  } catch (error) {
    console.error('Get latest TTV error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data TTV terbaru',
      error: error.message
    });
  }
};

module.exports = {
  getTTVByEncounter,
  getTTVById,
  createTTV,
  updateTTV,
  deleteTTV,
  getLatestTTV
};