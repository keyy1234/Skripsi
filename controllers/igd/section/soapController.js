// src/controllers/igd/section/soapController.js
const { supabase } = require('../../../config/supabase');

class SOAPController {
  /**
   * Get all SOAP notes by encounter ID
   * GET /api/igd/soap/:encounterId
   */
  async getSOAPByEncounter(req, res) {
    try {
      const { encounterId } = req.params;

      if (!encounterId) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
      }

      const { data, error } = await supabase
        .from('soap_notes')
        .select(`
          *,
          created_by_profile:profiles!soap_notes_created_by_fkey (
            id,
            name,
            role,
            specialization
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .order('note_time', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || [],
        message: 'SOAP notes fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching SOAP notes:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch SOAP notes',
        error: error.message
      });
    }
  }

  /**
   * Get single SOAP note by ID
   * GET /api/igd/soap/detail/:soapId
   */
  async getSOAPById(req, res) {
    try {
      const { soapId } = req.params;

      const { data, error } = await supabase
        .from('soap_notes')
        .select(`
          *,
          created_by_profile:profiles!soap_notes_created_by_fkey (
            id,
            name,
            role,
            specialization
          )
        `)
        .eq('soap_note_id', parseInt(soapId))
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'SOAP note not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: data,
        message: 'SOAP note fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching SOAP note:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch SOAP note',
        error: error.message
      });
    }
  }

  /**
   * Get all data untuk Plan (Treatment + Resep + Penunjang)
   * GET /api/igd/soap/plan-data/:encounterId
   */
  async getPlanData(req, res) {
    try {
      const { encounterId } = req.params;

      if (!encounterId) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
      }

      // 1. Ambil data Treatments
      const { data: treatments, error: treatmentsError } = await supabase
        .from('treatments')
        .select(`
          treatment_id,
          treatment_type,
          treatment_details,
          administered_at,
          administered_by_profile:profiles!treatments_administered_by_fkey (
            name,
            role
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .order('administered_at', { ascending: false });

      if (treatmentsError) throw treatmentsError;

      // 2. Ambil data Resep dari tabel resep_igd
      const { data: prescriptions, error: prescriptionsError } = await supabase
        .from('resep_igd')
        .select(`
          resep_id,
          resep_pulang,
          items,
          created_at,
          created_by_profile:profiles!resep_igd_created_by_fkey (
            name,
            role
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;

      // 3. Ambil data Diagnostic Tests (Penunjang)
      const { data: diagnosticTests, error: diagnosticError } = await supabase
        .from('diagnostic_tests')
        .select(`
          test_id,
          test_type,
          test_name,
          status,
          notes,
          requested_at,
          requested_by_profile:profiles!diagnostic_tests_requested_by_fkey (
            name,
            role
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .order('requested_at', { ascending: false });

      if (diagnosticError) throw diagnosticError;

      // Format Treatments untuk Plan
      const formattedTreatments = (treatments || []).map(tx => {
        const details = tx.treatment_details;
        let planText = '';
        
        switch (tx.treatment_type) {
          case 'MEDICATION':
            planText = `- 💊 ${details?.treatment_name || 'Obat'}`;
            if (details?.dosage) planText += ` ${details.dosage}`;
            if (details?.frequency) planText += `, ${details.frequency}`;
            if (details?.route) planText += ` (${details.route})`;
            if (details?.duration) planText += ` selama ${details.duration}`;
            break;
          case 'INFUS':
            planText = `- 💉 Infus: ${details?.treatment_name || 'Cairan'}`;
            if (details?.dosage) planText += ` ${details.dosage}`;
            break;
          case 'INJECTION':
            planText = `- 💉 Injeksi: ${details?.treatment_name || ''}`;
            if (details?.dosage) planText += ` ${details.dosage}`;
            break;
          case 'WOUND_CARE':
            planText = `- 🩹 Perawatan Luka: ${details?.treatment_name || 'Perawatan luka'}`;
            break;
          case 'OXYGEN':
            planText = `- 💨 Terapi Oksigen: ${details?.treatment_name || 'Oksigen'}`;
            if (details?.dosage) planText += ` ${details.dosage}`;
            break;
          default:
            planText = `- 📋 ${details?.treatment_name || tx.treatment_type}`;
        }
        
        if (details?.notes) {
          planText += ` (${details.notes})`;
        }
        
        return {
          id: tx.treatment_id,
          type: 'TREATMENT',
          text: planText,
          raw: tx,
          date: tx.administered_at
        };
      });

      // Format Resep untuk Plan
      const formattedPrescriptions = [];
      (prescriptions || []).forEach(resep => {
        const items = resep.items || [];
        items.forEach((item, idx) => {
          let planText = `- 💊 ${item.obat_nama || item.catatan_obat || 'Obat'}`;
          if (item.jumlah) planText += ` ${item.jumlah} ${item.satuan || 'pcs'}`;
          if (item.frekuensi) planText += `, ${item.frekuensi}`;
          if (item.rute) planText += ` (${item.rute})`;
          if (item.aturan_obat) planText += ` - ${item.aturan_obat}`;
          
          formattedPrescriptions.push({
            id: `${resep.resep_id}-${idx}`,
            type: 'PRESCRIPTION',
            text: planText,
            raw: { resep, item },
            date: resep.created_at
          });
        });
      });

      // Format Diagnostic Tests untuk Plan
      const formattedDiagnosticTests = (diagnosticTests || []).map(test => {
        let emoji = '';
        switch (test.test_type) {
          case 'LAB': emoji = '🔬'; break;
          case 'RADIOLOGY': emoji = '📷'; break;
          case 'ECG': emoji = '📈'; break;
          case 'USG': emoji = '🩺'; break;
          case 'MRI': emoji = '🧠'; break;
          case 'CT_SCAN': emoji = '📡'; break;
          default: emoji = '📋';
        }
        
        let planText = `- ${emoji} ${test.test_name}`;
        if (test.notes) planText += ` (${test.notes})`;
        if (test.status === 'COMPLETED') planText += ` ✅`;
        else if (test.status === 'PROCESSING') planText += ` ⏳`;
        else if (test.status === 'REQUESTED') planText += ` 📝`;
        
        return {
          id: test.test_id,
          type: 'DIAGNOSTIC_TEST',
          text: planText,
          raw: test,
          date: test.requested_at
        };
      });

      // Gabungkan semua
      const allPlanItems = [
        ...formattedTreatments,
        ...formattedPrescriptions,
        ...formattedDiagnosticTests
      ];

      // Urutkan berdasarkan tanggal (terbaru di atas)
      allPlanItems.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Generate formatted plan text untuk auto-fill
      const formattedPlanText = `
**💊 Rencana Tindakan Medis:**
${formattedTreatments.length > 0 ? formattedTreatments.map(t => t.text).join('\n') : '- Belum ada tindakan medis'}

**💊 Rencana Terapi Obat:**
${formattedPrescriptions.length > 0 ? formattedPrescriptions.map(p => p.text).join('\n') : '- Belum ada resep obat'}

**🔬 Rencana Pemeriksaan Penunjang:**
${formattedDiagnosticTests.length > 0 ? formattedDiagnosticTests.map(d => d.text).join('\n') : '- Belum ada pemeriksaan penunjang'}
`;

      return res.status(200).json({
        success: true,
        data: {
          allItems: allPlanItems,
          grouped: {
            treatments: formattedTreatments,
            prescriptions: formattedPrescriptions,
            diagnosticTests: formattedDiagnosticTests
          },
          formattedPlan: formattedPlanText,
          counts: {
            treatments: formattedTreatments.length,
            prescriptions: formattedPrescriptions.length,
            diagnosticTests: formattedDiagnosticTests.length,
            total: allPlanItems.length
          }
        },
        message: 'Plan data fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching plan data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch plan data',
        error: error.message
      });
    }
  }

  /**
   * Get latest treatments for Plan (Planning)
   * GET /api/igd/soap/latest-treatments/:encounterId
   */
  async getLatestTreatmentsForPlan(req, res) {
    try {
      const { encounterId } = req.params;
      const { limit = 5 } = req.query;

      const { data, error } = await supabase
        .from('treatments')
        .select(`
          treatment_id,
          treatment_type,
          treatment_details,
          administered_at,
          administered_by_profile:profiles!treatments_administered_by_fkey (
            name,
            role
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .order('administered_at', { ascending: false })
        .limit(parseInt(limit));

      if (error) throw error;

      const formattedPlan = data.map(tx => {
        const details = tx.treatment_details;
        let planText = '';
        
        switch (tx.treatment_type) {
          case 'MEDICATION':
            planText = `- 💊 ${details?.treatment_name || 'Obat'} ${details?.dosage ? `${details.dosage}` : ''} ${details?.frequency ? `, ${details.frequency}` : ''} (${details?.route || ''})`;
            break;
          case 'INFUS':
            planText = `- 💉 Pemasangan Infus: ${details?.treatment_name || 'Cairan'} ${details?.dosage || ''}`;
            break;
          case 'INJECTION':
            planText = `- 💉 Injeksi: ${details?.treatment_name || ''} ${details?.dosage || ''}`;
            break;
          case 'WOUND_CARE':
            planText = `- 🩹 Perawatan Luka: ${details?.treatment_name || 'Perawatan luka'}`;
            break;
          case 'OXYGEN':
            planText = `- 💨 Terapi Oksigen: ${details?.treatment_name || 'Oksigen'} ${details?.dosage || ''}`;
            break;
          default:
            planText = `- 📋 ${details?.treatment_name || tx.treatment_type}`;
        }
        
        if (details?.notes) {
          planText += ` (${details.notes})`;
        }
        
        return planText;
      }).filter(text => text);

      return res.status(200).json({
        success: true,
        data: {
          treatments: data,
          formattedPlan: formattedPlan.join('\n'),
          count: data.length
        },
        message: 'Latest treatments fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching treatments for plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch treatments',
        error: error.message
      });
    }
  }

  /**
   * Get latest diagnoses for Assessment
   * GET /api/igd/soap/latest-diagnoses/:encounterId
   */
  async getLatestDiagnosesForAssessment(req, res) {
    try {
      const { encounterId } = req.params;

      const { data, error } = await supabase
        .from('diagnoses')
        .select(`
          diagnosis_id,
          diagnosis_code,
          diagnosis_name,
          diagnosis_type,
          is_primary,
          notes,
          created_at
        `)
        .eq('encounter_id', parseInt(encounterId))
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const primaryDiagnosis = data?.find(d => d.is_primary === true);
      const otherDiagnoses = data?.filter(d => d.is_primary !== true);

      let assessmentText = '';

      if (primaryDiagnosis) {
        assessmentText += `**Diagnosis Utama:** ${primaryDiagnosis.diagnosis_name}`;
        if (primaryDiagnosis.diagnosis_code) {
          assessmentText += ` (${primaryDiagnosis.diagnosis_code})`;
        }
        assessmentText += '\n';
      }

      if (otherDiagnoses && otherDiagnoses.length > 0) {
        assessmentText += `\n**Diagnosis Lain:**\n`;
        otherDiagnoses.forEach(d => {
          assessmentText += `- ${d.diagnosis_name}`;
          if (d.diagnosis_code) assessmentText += ` (${d.diagnosis_code})`;
          if (d.notes) assessmentText += ` - ${d.notes}`;
          assessmentText += '\n';
        });
      }

      if (!primaryDiagnosis && (!otherDiagnoses || otherDiagnoses.length === 0)) {
        assessmentText = 'Belum ada diagnosis yang tercatat';
      }

      return res.status(200).json({
        success: true,
        data: {
          diagnoses: data || [],
          formattedAssessment: assessmentText,
          primaryDiagnosis: primaryDiagnosis || null,
          otherDiagnoses: otherDiagnoses || []
        },
        message: 'Latest diagnoses fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching diagnoses for assessment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch diagnoses',
        error: error.message
      });
    }
  }

  /**
   * Generate objective text from latest TTV
   * Helper function
   */
  async generateObjectiveFromTTV(encounterId) {
    try {
      const { data: ttv, error } = await supabase
        .from('vital_signs')
        .select('vital_sign_data, measurement_time')
        .eq('encounter_id', parseInt(encounterId))
        .order('measurement_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !ttv) {
        return null;
      }

      const ttvData = ttv.vital_sign_data;
      const parts = [];

      if (ttvData.systolic && ttvData.diastolic) {
        parts.push(`TD: ${ttvData.systolic}/${ttvData.diastolic} mmHg`);
      }
      if (ttvData.heart_rate) {
        parts.push(`Nadi: ${ttvData.heart_rate} x/menit`);
      }
      if (ttvData.respiratory_rate) {
        parts.push(`Napas: ${ttvData.respiratory_rate} x/menit`);
      }
      if (ttvData.temperature) {
        parts.push(`Suhu: ${ttvData.temperature}°C`);
      }
      if (ttvData.spo2) {
        parts.push(`SpO2: ${ttvData.spo2}%`);
      }
      if (ttvData.weight) {
        parts.push(`BB: ${ttvData.weight} kg`);
      }
      if (ttvData.height) {
        parts.push(`TB: ${ttvData.height} cm`);
      }
      if (ttvData.bmi) {
        parts.push(`BMI: ${ttvData.bmi}`);
      }

      if (parts.length === 0) return null;

      const timeInfo = ttv.measurement_time
        ? `\n*(Diukur pada: ${new Date(ttv.measurement_time).toLocaleString('id-ID')})*`
        : '';

      return `**TTV:** ${parts.join(', ')}${timeInfo}`;
    } catch (error) {
      console.error('Error generating objective from TTV:', error);
      return null;
    }
  }

  /**
   * Generate Plan dari Treatments
   * GET /api/igd/soap/generate-plan/:encounterId
   */
  async generatePlanFromTreatments(req, res) {
    try {
      const { encounterId } = req.params;

      const { data, error } = await supabase
        .from('treatments')
        .select('treatment_type, treatment_details, administered_at')
        .eq('encounter_id', parseInt(encounterId))
        .eq('treatment_type', 'MEDICATION')
        .order('administered_at', { ascending: false });

      if (error) throw error;

      const activeTreatments = data.filter(tx => {
        const duration = tx.treatment_details?.duration;
        if (!duration) return true;
        if (duration.toLowerCase().includes('hari')) {
          return true;
        }
        return true;
      });

      const planText = activeTreatments.map(tx => {
        const details = tx.treatment_details;
        return `- Lanjutkan ${details?.treatment_name || 'terapi'} ${details?.dosage ? `dosis ${details.dosage}` : ''} ${details?.frequency ? `, ${details.frequency}` : ''}`;
      }).join('\n');

      return res.status(200).json({
        success: true,
        data: {
          plan: planText || 'Tidak ada treatment aktif',
          treatments: activeTreatments
        }
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate plan',
        error: error.message
      });
    }
  }

  /**
   * Create new SOAP note with auto-fill from TTV, Treatments, and Diagnoses
   * POST /api/igd/soap
   */
  async createSOAP(req, res) {
    try {
      const {
        encounter_id,
        subjective,
        objective,
        assessment,
        plan,
        note_time,
        auto_fill_from_treatments = false,
        auto_fill_from_diagnoses = false
      } = req.body;

      if (!encounter_id) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
      }

      if (!subjective && !objective && !assessment && !plan) {
        return res.status(400).json({
          success: false,
          message: 'Isi minimal satu bagian SOAP'
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      // Auto-fill Objective dari TTV
      let finalObjective = objective;
      if (!finalObjective || finalObjective.trim() === '') {
        const generatedObjective = await this.generateObjectiveFromTTV(encounter_id);
        if (generatedObjective) {
          finalObjective = generatedObjective;
        }
      }

      // Auto-fill Assessment dari Diagnoses
      let finalAssessment = assessment;
      if (auto_fill_from_diagnoses && (!finalAssessment || finalAssessment.trim() === '')) {
        const { data: diagnosesData } = await supabase
          .from('diagnoses')
          .select('diagnosis_name, diagnosis_code, is_primary, notes')
          .eq('encounter_id', parseInt(encounter_id))
          .order('is_primary', { ascending: false });
        
        if (diagnosesData && diagnosesData.length > 0) {
          const primaryDiag = diagnosesData.find(d => d.is_primary);
          const otherDiags = diagnosesData.filter(d => !d.is_primary);
          
          let assessmentText = '';
          if (primaryDiag) {
            assessmentText += `Diagnosis Utama: ${primaryDiag.diagnosis_name}`;
            if (primaryDiag.diagnosis_code) assessmentText += ` (${primaryDiag.diagnosis_code})`;
            assessmentText += '\n';
          }
          if (otherDiags.length > 0) {
            assessmentText += `\nDiagnosis Lain:\n`;
            otherDiags.forEach(d => {
              assessmentText += `- ${d.diagnosis_name}`;
              if (d.diagnosis_code) assessmentText += ` (${d.diagnosis_code})`;
              if (d.notes) assessmentText += ` - ${d.notes}`;
              assessmentText += '\n';
            });
          }
          finalAssessment = assessmentText;
        }
      }

      // Auto-fill Plan dari Treatments
      let finalPlan = plan;
      if (auto_fill_from_treatments && (!finalPlan || finalPlan.trim() === '')) {
        const { data: treatmentsData } = await supabase
          .from('treatments')
          .select('treatment_type, treatment_details')
          .eq('encounter_id', parseInt(encounter_id))
          .order('administered_at', { ascending: false })
          .limit(10);
        
        if (treatmentsData && treatmentsData.length > 0) {
          const planText = treatmentsData.map(tx => {
            const details = tx.treatment_details;
            let text = '';
            switch (tx.treatment_type) {
              case 'MEDICATION':
                text = `- Lanjutkan ${details?.treatment_name || 'obat'} ${details?.dosage || ''} ${details?.frequency || ''}`;
                break;
              case 'INFUS':
                text = `- Lanjutkan infus ${details?.treatment_name || ''}`;
                break;
              default:
                text = `- Lanjutkan perawatan: ${details?.treatment_name || tx.treatment_type}`;
            }
            return text.trim();
          }).filter(t => t).join('\n');
          
          finalPlan = planText || finalPlan;
        }
      }

      const soapData = {
        encounter_id: parseInt(encounter_id),
        subjective: subjective || null,
        objective: finalObjective || null,
        assessment: finalAssessment || null,
        plan: finalPlan || null,
        created_by: currentProfileId,
        note_time: note_time || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('soap_notes')
        .insert([soapData])
        .select(`
          *,
          created_by_profile:profiles!soap_notes_created_by_fkey (
            id,
            name,
            role,
            specialization
          )
        `)
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: data,
        message: 'SOAP note created successfully',
        auto_filled: {
          objective: !objective && !!finalObjective,
          assessment: auto_fill_from_diagnoses && !assessment && !!finalAssessment,
          plan: auto_fill_from_treatments && !plan && !!finalPlan
        }
      });
    } catch (error) {
      console.error('Error creating SOAP note:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create SOAP note',
        error: error.message
      });
    }
  }

  /**
   * Update SOAP note
   * PUT /api/igd/soap/:soapId
   */
  async updateSOAP(req, res) {
    try {
      const { soapId } = req.params;
      const { subjective, objective, assessment, plan, note_time } = req.body;

      const { data: existingSOAP, error: checkError } = await supabase
        .from('soap_notes')
        .select('soap_note_id')
        .eq('soap_note_id', parseInt(soapId))
        .single();

      if (checkError || !existingSOAP) {
        return res.status(404).json({
          success: false,
          message: 'SOAP note not found'
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      const updateData = {
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      if (subjective !== undefined) updateData.subjective = subjective || null;
      if (objective !== undefined) updateData.objective = objective || null;
      if (assessment !== undefined) updateData.assessment = assessment || null;
      if (plan !== undefined) updateData.plan = plan || null;
      if (note_time !== undefined) updateData.note_time = note_time;

      const { data, error } = await supabase
        .from('soap_notes')
        .update(updateData)
        .eq('soap_note_id', parseInt(soapId))
        .select(`
          *,
          created_by_profile:profiles!soap_notes_created_by_fkey (
            id,
            name,
            role,
            specialization
          )
        `)
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: 'SOAP note updated successfully'
      });
    } catch (error) {
      console.error('Error updating SOAP note:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update SOAP note',
        error: error.message
      });
    }
  }

  /**
   * Delete SOAP note
   * DELETE /api/igd/soap/:soapId
   */
  async deleteSOAP(req, res) {
    try {
      const { soapId } = req.params;

      const { data: existingSOAP, error: checkError } = await supabase
        .from('soap_notes')
        .select('soap_note_id')
        .eq('soap_note_id', parseInt(soapId))
        .single();

      if (checkError || !existingSOAP) {
        return res.status(404).json({
          success: false,
          message: 'SOAP note not found'
        });
      }

      const { error } = await supabase
        .from('soap_notes')
        .delete()
        .eq('soap_note_id', parseInt(soapId));

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'SOAP note deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting SOAP note:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete SOAP note',
        error: error.message
      });
    }
  }

  /**
   * Get latest TTV for encounter
   * GET /api/igd/soap/latest-ttv/:encounterId
   */
  async getLatestTTV(req, res) {
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

      return res.status(200).json({
        success: true,
        data: data || null,
        message: 'Latest TTV fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching latest TTV:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch latest TTV',
        error: error.message
      });
    }
  }
}

module.exports = new SOAPController();