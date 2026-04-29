// src/controllers/igd/section/treatmentController.js
const { supabase } = require('../../../config/supabase');

class TreatmentController {
  /**
   * Get all treatments by encounter ID
   * GET /api/igd/treatments/:encounterId
   */
  async getTreatmentsByEncounter(req, res) {
    try {
      const { encounterId } = req.params;

      if (!encounterId) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
      }

      const { data, error } = await supabase
        .from('treatments')
        .select(`
          *,
          administered_by_profile:profiles!treatments_administered_by_fkey (
            id,
            name,
            role,
            specialization,
            user_id,
            nip
          ),
          created_by_profile:profiles!treatments_created_by_fkey (
            id,
            name,
            role
          ),
          updated_by_profile:profiles!treatments_updated_by_fkey (
            id,
            name,
            role
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .order('administered_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || [],
        message: 'Treatments fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching treatments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch treatments',
        error: error.message
      });
    }
  }

  /**
   * Get single treatment by ID
   * GET /api/igd/treatments/detail/:treatmentId
   */
  async getTreatmentById(req, res) {
    try {
      const { treatmentId } = req.params;

      const { data, error } = await supabase
        .from('treatments')
        .select(`
          *,
          administered_by_profile:profiles!treatments_administered_by_fkey (
            id,
            name,
            role,
            specialization,
            user_id,
            nip
          ),
          created_by_profile:profiles!treatments_created_by_fkey (
            id,
            name,
            role
          )
        `)
        .eq('treatment_id', parseInt(treatmentId))
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Treatment not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Treatment fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching treatment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch treatment',
        error: error.message
      });
    }
  }

  /**
   * Get daftar tenaga medis dari profiles (dokter_dpjp dan perawat)
   * GET /api/igd/medic-staff
   */
  async getMedicStaff(req, res) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, specialization, user_id, nip')
        .in('role', ['dokter_dpjp', 'perawat'])
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || [],
        message: 'Medic staff fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching medic staff:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch medic staff',
        error: error.message
      });
    }
  }

  /**
   * Create new treatment
   * POST /api/igd/treatments
   */
  async createTreatment(req, res) {
    try {
      const {
        encounter_id,
        treatment_type,
        treatment_details,
        administered_by,
        administered_at
      } = req.body;

      // Validasi required fields
      if (!encounter_id) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
      }

      if (!treatment_type) {
        return res.status(400).json({
          success: false,
          message: 'Treatment type is required'
        });
      }

      if (!administered_by) {
        return res.status(400).json({
          success: false,
          message: 'Administered by (petugas pelaksana) is required'
        });
      }

      // Validasi treatment_type
      const validTreatmentTypes = [
        'MEDICATION', 'INFUS', 'INJECTION', 'WOUND_CARE',
        'CATHETER', 'NGT', 'OXYGEN', 'NEBULIZER', 
        'SUCTION', 'ECG', 'OTHER','PROCEDURE'
      ];
      
      if (!validTreatmentTypes.includes(treatment_type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid treatment type. Must be one of: ${validTreatmentTypes.join(', ')}`
        });
      }

      // Validasi apakah administered_by valid (ada di profiles)
      const { data: staffCheck, error: staffError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', administered_by)
        .single();

      if (staffError || !staffCheck) {
        return res.status(400).json({
          success: false,
          message: 'Petugas pelaksana tidak valid atau tidak ditemukan'
        });
      }

      // Ambil user yang sedang login dari token (sudah di-set oleh authMiddleware)
      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      // Clean up treatment_details (remove empty fields)
      const cleanedDetails = {};
      if (treatment_details) {
        Object.keys(treatment_details).forEach(key => {
          if (treatment_details[key] && treatment_details[key] !== '') {
            cleanedDetails[key] = treatment_details[key];
          }
        });
      }

      const treatmentData = {
        encounter_id: parseInt(encounter_id),
        treatment_type: treatment_type,
        treatment_details: cleanedDetails,
        administered_by: administered_by,
        administered_at: administered_at || new Date().toISOString(),
        created_by: currentProfileId,
        created_at: new Date().toISOString(),
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('treatments')
        .insert([treatmentData])
        .select(`
          *,
          administered_by_profile:profiles!treatments_administered_by_fkey (
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
        message: 'Treatment created successfully'
      });
    } catch (error) {
      console.error('Error creating treatment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create treatment',
        error: error.message
      });
    }
  }

  /**
   * Update treatment
   * PUT /api/igd/treatments/:treatmentId
   */
  async updateTreatment(req, res) {
    try {
      const { treatmentId } = req.params;
      const {
        treatment_type,
        treatment_details,
        administered_by,
        administered_at,
        notes
      } = req.body;

      // Cek apakah treatment exists
      const { data: existingTreatment, error: checkError } = await supabase
        .from('treatments')
        .select('treatment_id, treatment_details')
        .eq('treatment_id', parseInt(treatmentId))
        .single();

      if (checkError || !existingTreatment) {
        return res.status(404).json({
          success: false,
          message: 'Treatment not found'
        });
      }

      // Jika administered_by diubah, validasi apakah valid
      if (administered_by) {
        const { data: staffCheck, error: staffError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', administered_by)
          .single();

        if (staffError || !staffCheck) {
          return res.status(400).json({
            success: false,
            message: 'Petugas pelaksana tidak valid atau tidak ditemukan'
          });
        }
      }

      // Ambil user yang sedang login
      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      // Prepare update data
      const updateData = {
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      if (treatment_type) updateData.treatment_type = treatment_type;
      if (administered_by) updateData.administered_by = administered_by;
      if (administered_at) updateData.administered_at = administered_at;
      
      if (treatment_details) {
        // Clean up treatment_details
        const cleanedDetails = {};
        Object.keys(treatment_details).forEach(key => {
          if (treatment_details[key] && treatment_details[key] !== '') {
            cleanedDetails[key] = treatment_details[key];
          }
        });
        updateData.treatment_details = cleanedDetails;
      }
      
      if (notes) {
        updateData.treatment_details = {
          ...(existingTreatment.treatment_details || {}),
          notes: notes
        };
      }

      const { data, error } = await supabase
        .from('treatments')
        .update(updateData)
        .eq('treatment_id', parseInt(treatmentId))
        .select(`
          *,
          administered_by_profile:profiles!treatments_administered_by_fkey (
            id,
            name,
            role,
            specialization
          ),
          updated_by_profile:profiles!treatments_updated_by_fkey (
            id,
            name,
            role
          )
        `)
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Treatment updated successfully'
      });
    } catch (error) {
      console.error('Error updating treatment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update treatment',
        error: error.message
      });
    }
  }

  /**
   * Delete treatment
   * DELETE /api/igd/treatments/:treatmentId
   */
  async deleteTreatment(req, res) {
    try {
      const { treatmentId } = req.params;

      // Cek apakah treatment exists
      const { data: existingTreatment, error: checkError } = await supabase
        .from('treatments')
        .select('treatment_id')
        .eq('treatment_id', parseInt(treatmentId))
        .single();

      if (checkError || !existingTreatment) {
        return res.status(404).json({
          success: false,
          message: 'Treatment not found'
        });
      }

      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('treatment_id', parseInt(treatmentId));

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Treatment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting treatment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete treatment',
        error: error.message
      });
    }
  }

  /**
   * Get treatments by type
   * GET /api/igd/treatments/filter/by-type?type=MEDICATION&encounterId=123
   */
  async getTreatmentsByType(req, res) {
    try {
      const { type, encounterId } = req.query;

      if (!type || !encounterId) {
        return res.status(400).json({
          success: false,
          message: 'Type and encounterId are required'
        });
      }

      const { data, error } = await supabase
        .from('treatments')
        .select(`
          *,
          administered_by_profile:profiles!treatments_administered_by_fkey (
            id,
            name,
            role
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .eq('treatment_type', type)
        .order('administered_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || [],
        message: 'Treatments filtered successfully'
      });
    } catch (error) {
      console.error('Error filtering treatments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to filter treatments',
        error: error.message
      });
    }
  }

  /**
   * Get treatment statistics for an encounter
   * GET /api/igd/treatments/stats/:encounterId
   */
  async getTreatmentStats(req, res) {
    try {
      const { encounterId } = req.params;

      const { data, error } = await supabase
        .from('treatments')
        .select('treatment_type, administered_at')
        .eq('encounter_id', parseInt(encounterId));

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: data.length,
        byType: {},
        today: 0,
        last7Days: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      data.forEach(treatment => {
        // Count by type
        stats.byType[treatment.treatment_type] = (stats.byType[treatment.treatment_type] || 0) + 1;
        
        // Count today
        const treatmentDate = new Date(treatment.administered_at);
        treatmentDate.setHours(0, 0, 0, 0);
        
        if (treatmentDate.getTime() === today.getTime()) {
          stats.today++;
        }
        
        // Count last 7 days
        if (treatmentDate >= sevenDaysAgo) {
          stats.last7Days++;
        }
      });

      return res.status(200).json({
        success: true,
        data: stats,
        message: 'Treatment statistics fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching treatment stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch treatment statistics',
        error: error.message
      });
    }
  }
}

module.exports = new TreatmentController();