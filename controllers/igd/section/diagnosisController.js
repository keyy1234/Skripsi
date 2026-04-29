// src/controllers/igd/section/diagnosisController.js
const { supabase } = require('../../../config/supabase');

class DiagnosisController {
  /**
   * Get all diagnoses by encounter ID
   * GET /api/igd/diagnosis/:encounterId
   */
  async getDiagnosesByEncounter(req, res) {
    try {
      const { encounterId } = req.params;

      if (!encounterId || isNaN(parseInt(encounterId))) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required and must be a valid number'
        });
      }

      const { data, error } = await supabase
        .from('diagnoses')
        .select(`
          *,
          diagnosed_by_profile:profiles!diagnoses_diagnosed_by_fkey (
            id,
            name,
            role,
            specialization
          ),
          created_by_profile:profiles!diagnoses_created_by_fkey (
            id,
            name,
            role
          ),
          confirmed_by_profile:profiles!diagnoses_confirmed_by_fkey (
            id,
            name,
            role
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .eq('is_deleted', false)
        .order('diagnosed_at', { ascending: false });

      if (error) throw error;

      // Transform data untuk frontend
      const transformedData = (data || []).map(item => ({
        ...item,
        medic_staff: item.diagnosed_by_profile,
        icd10_codes: item.icd10_code ? {
          code: item.icd10_code,
          description: item.diagnosis_name,
          category: null
        } : null
      }));

      return res.status(200).json({
        success: true,
        data: transformedData,
        message: 'Diagnoses fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch diagnoses',
        error: error.message
      });
    }
  }

  /**
   * Get single diagnosis by ID
   * GET /api/igd/diagnosis/detail/:diagnosisId
   */
  async getDiagnosisById(req, res) {
    try {
      const { diagnosisId } = req.params;

      if (!diagnosisId || isNaN(parseInt(diagnosisId))) {
        return res.status(400).json({
          success: false,
          message: 'Diagnosis ID is required and must be a valid number'
        });
      }

      const { data, error } = await supabase
        .from('diagnoses')
        .select(`
          *,
          diagnosed_by_profile:profiles!diagnoses_diagnosed_by_fkey (
            id,
            name,
            role,
            specialization
          ),
          created_by_profile:profiles!diagnoses_created_by_fkey (
            id,
            name,
            role
          ),
          confirmed_by_profile:profiles!diagnoses_confirmed_by_fkey (
            id,
            name,
            role
          )
        `)
        .eq('diagnosis_id', parseInt(diagnosisId))
        .eq('is_deleted', false)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Diagnosis not found'
        });
      }

      const transformedData = {
        ...data,
        medic_staff: data.diagnosed_by_profile,
        icd10_codes: data.icd10_code ? {
          code: data.icd10_code,
          description: data.diagnosis_name,
          category: null
        } : null
      };

      return res.status(200).json({
        success: true,
        data: transformedData,
        message: 'Diagnosis fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching diagnosis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch diagnosis',
        error: error.message
      });
    }
  }

  /**
   * Create new diagnosis
   * POST /api/igd/diagnosis
   */
  async createDiagnosis(req, res) {
    try {
      const {
        encounter_id,
        icd10_code,
        diagnosis_name,
        notes,
        diagnosed_by,
        is_primary
      } = req.body;

      // Validasi encounter_id
      if (!encounter_id || isNaN(parseInt(encounter_id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid Encounter ID is required'
        });
      }

      if (!icd10_code && !diagnosis_name) {
        return res.status(400).json({
          success: false,
          message: 'ICD-10 code or diagnosis name is required'
        });
      }

      if (!diagnosed_by) {
        return res.status(400).json({
          success: false,
          message: 'Diagnosed by (dokter) is required'
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      // Jika is_primary true, update diagnosis lain menjadi non-primary
      if (is_primary === true) {
        await supabase
          .from('diagnoses')
          .update({ is_primary: false })
          .eq('encounter_id', parseInt(encounter_id))
          .eq('is_deleted', false);
      }

      const diagnosisData = {
        encounter_id: parseInt(encounter_id),
        icd10_code: icd10_code || null,
        diagnosis_code: icd10_code || null,
        diagnosis_name: diagnosis_name,
        notes: notes || null,
        is_primary: is_primary || false,
        diagnosed_by: diagnosed_by,
        diagnosed_at: new Date().toISOString(),
        created_by: currentProfileId,
        created_at: new Date().toISOString(),
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('diagnoses')
        .insert([diagnosisData])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: data,
        message: 'Diagnosis created successfully'
      });
    } catch (error) {
      console.error('Error creating diagnosis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create diagnosis',
        error: error.message
      });
    }
  }

  /**
   * Update diagnosis
   * PUT /api/igd/diagnosis/:diagnosisId
   */
  async updateDiagnosis(req, res) {
    try {
      const { diagnosisId } = req.params;
      const {
        icd10_code,
        diagnosis_name,
        notes,
        is_primary,
        confirmed_by,
        status
      } = req.body;

      if (!diagnosisId || isNaN(parseInt(diagnosisId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid Diagnosis ID is required'
        });
      }

      const { data: existingDiagnosis, error: checkError } = await supabase
        .from('diagnoses')
        .select('diagnosis_id, encounter_id')
        .eq('diagnosis_id', parseInt(diagnosisId))
        .eq('is_deleted', false)
        .single();

      if (checkError || !existingDiagnosis) {
        return res.status(404).json({
          success: false,
          message: 'Diagnosis not found'
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      if (is_primary === true) {
        await supabase
          .from('diagnoses')
          .update({ is_primary: false })
          .eq('encounter_id', existingDiagnosis.encounter_id)
          .eq('is_deleted', false)
          .neq('diagnosis_id', parseInt(diagnosisId));
      }

      const updateData = {
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      if (icd10_code !== undefined) {
        updateData.icd10_code = icd10_code;
        updateData.diagnosis_code = icd10_code;
      }
      if (diagnosis_name !== undefined) updateData.diagnosis_name = diagnosis_name;
      if (notes !== undefined) updateData.notes = notes;
      if (is_primary !== undefined) updateData.is_primary = is_primary;
      if (status !== undefined) updateData.status = status;
      
      if (confirmed_by) {
        updateData.confirmed_by = confirmed_by;
        updateData.confirmed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('diagnoses')
        .update(updateData)
        .eq('diagnosis_id', parseInt(diagnosisId))
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Diagnosis updated successfully'
      });
    } catch (error) {
      console.error('Error updating diagnosis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update diagnosis',
        error: error.message
      });
    }
  }

  /**
   * Delete diagnosis (soft delete)
   * DELETE /api/igd/diagnosis/:diagnosisId
   */
  async deleteDiagnosis(req, res) {
    try {
      const { diagnosisId } = req.params;

      if (!diagnosisId || isNaN(parseInt(diagnosisId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid Diagnosis ID is required'
        });
      }

      const { data: existingDiagnosis, error: checkError } = await supabase
        .from('diagnoses')
        .select('diagnosis_id')
        .eq('diagnosis_id', parseInt(diagnosisId))
        .eq('is_deleted', false)
        .single();

      if (checkError || !existingDiagnosis) {
        return res.status(404).json({
          success: false,
          message: 'Diagnosis not found'
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      const { error } = await supabase
        .from('diagnoses')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: currentProfileId,
          updated_by: currentProfileId,
          updated_at: new Date().toISOString()
        })
        .eq('diagnosis_id', parseInt(diagnosisId));

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Diagnosis deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete diagnosis',
        error: error.message
      });
    }
  }

  /**
   * Set primary diagnosis
   * PATCH /api/igd/diagnosis/:diagnosisId/primary
   */
  async setPrimaryDiagnosis(req, res) {
    try {
      const { diagnosisId } = req.params;

      if (!diagnosisId || isNaN(parseInt(diagnosisId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid Diagnosis ID is required'
        });
      }

      const { data: existingDiagnosis, error: checkError } = await supabase
        .from('diagnoses')
        .select('diagnosis_id, encounter_id')
        .eq('diagnosis_id', parseInt(diagnosisId))
        .eq('is_deleted', false)
        .single();

      if (checkError || !existingDiagnosis) {
        return res.status(404).json({
          success: false,
          message: 'Diagnosis not found'
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      await supabase
        .from('diagnoses')
        .update({ is_primary: false })
        .eq('encounter_id', existingDiagnosis.encounter_id)
        .eq('is_deleted', false)
        .neq('diagnosis_id', parseInt(diagnosisId));

      const { data, error } = await supabase
        .from('diagnoses')
        .update({
          is_primary: true,
          updated_by: currentProfileId,
          updated_at: new Date().toISOString()
        })
        .eq('diagnosis_id', parseInt(diagnosisId))
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Primary diagnosis set successfully'
      });
    } catch (error) {
      console.error('Error setting primary diagnosis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to set primary diagnosis',
        error: error.message
      });
    }
  }

  /**
   * Confirm diagnosis
   * PATCH /api/igd/diagnosis/:diagnosisId/confirm
   */
  async confirmDiagnosis(req, res) {
    try {
      const { diagnosisId } = req.params;

      if (!diagnosisId || isNaN(parseInt(diagnosisId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid Diagnosis ID is required'
        });
      }

      const { data: existingDiagnosis, error: checkError } = await supabase
        .from('diagnoses')
        .select('diagnosis_id')
        .eq('diagnosis_id', parseInt(diagnosisId))
        .eq('is_deleted', false)
        .single();

      if (checkError || !existingDiagnosis) {
        return res.status(404).json({
          success: false,
          message: 'Diagnosis not found'
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      const { data, error } = await supabase
        .from('diagnoses')
        .update({
          confirmed_by: currentProfileId,
          confirmed_at: new Date().toISOString(),
          status: 'CONFIRMED',
          updated_by: currentProfileId,
          updated_at: new Date().toISOString()
        })
        .eq('diagnosis_id', parseInt(diagnosisId))
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Diagnosis confirmed successfully'
      });
    } catch (error) {
      console.error('Error confirming diagnosis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to confirm diagnosis',
        error: error.message
      });
    }
  }

  /**
   * Get ICD-10 codes list (public endpoint - NO encounterId required)
   * GET /api/igd/diagnosis/icd10?search=...
   * 
   * ENDPOINT INI TIDAK MEMERLUKAN ENCOUNTER ID!
   */
  async getIcd10Codes(req, res) {
    try {
      const { search } = req.query;

      // Langsung query tanpa validasi encounterId
      let query = supabase
        .from('icd10_codes')
        .select('code, description, category')
        .order('code');

      if (search && search.length >= 2) {
        query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Supabase error fetching ICD-10:', error);
        // Return empty array instead of error to prevent frontend crash
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No ICD-10 codes found. Please seed the icd10_codes table.'
        });
      }

      // Jika data kosong, tetap return success dengan array kosong
      if (!data || data.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No ICD-10 codes found. Please add data to icd10_codes table.'
        });
      }

      return res.status(200).json({
        success: true,
        data: data,
        message: 'ICD-10 codes fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching ICD-10 codes:', error);
      // Return empty array to prevent frontend crash
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Failed to fetch ICD-10 codes, but continuing'
      });
    }
  }

  /**
   * Get primary diagnosis for encounter
   * GET /api/igd/diagnosis/primary/:encounterId
   */
  async getPrimaryDiagnosis(req, res) {
    try {
      const { encounterId } = req.params;

      if (!encounterId || isNaN(parseInt(encounterId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid Encounter ID is required'
        });
      }

      const { data, error } = await supabase
        .from('diagnoses')
        .select(`
          *,
          diagnosed_by_profile:profiles!diagnoses_diagnosed_by_fkey (
            id,
            name,
            role,
            specialization
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .eq('is_primary', true)
        .eq('is_deleted', false)
        .maybeSingle();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || null,
        message: 'Primary diagnosis fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching primary diagnosis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch primary diagnosis',
        error: error.message
      });
    }
  }

  /**
   * Get diagnosis statistics for an encounter
   * GET /api/igd/diagnosis/stats/:encounterId
   */
  async getDiagnosisStats(req, res) {
    try {
      const { encounterId } = req.params;

      if (!encounterId || isNaN(parseInt(encounterId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid Encounter ID is required'
        });
      }

      const { data, error } = await supabase
        .from('diagnoses')
        .select('is_primary, status, diagnosis_name')
        .eq('encounter_id', parseInt(encounterId))
        .eq('is_deleted', false);

      if (error) throw error;

      const stats = {
        total: data.length,
        primary: data.filter(d => d.is_primary === true).length,
        confirmed: data.filter(d => d.status === 'CONFIRMED').length,
        unconfirmed: data.filter(d => d.status !== 'CONFIRMED' || !d.status).length,
        diagnoses: data.map(d => d.diagnosis_name)
      };

      return res.status(200).json({
        success: true,
        data: stats,
        message: 'Diagnosis statistics fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching diagnosis stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch diagnosis statistics',
        error: error.message
      });
    }
  }
}

module.exports = new DiagnosisController();