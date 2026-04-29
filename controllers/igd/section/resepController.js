// src/controllers/igd/section/penunjangController.js
const { supabase } = require('../../../config/supabase');

class ResepController {
  /**
   * Get all prescriptions by encounter ID
   * GET /api/igd/resep/:encounterId
   */
  async getResepByEncounter(req, res) {
    try {
      const { encounterId } = req.params;

      if (!encounterId) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
      }

      const { data, error } = await supabase
        .from('resep_igd')
        .select(`
          *,
          created_by_profile:profiles!resep_igd_created_by_fkey (
            id,
            name,
            role
          ),
          updated_by_profile:profiles!resep_igd_updated_by_fkey (
            id,
            name,
            role
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || [],
        message: 'Prescriptions fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch prescriptions',
        error: error.message
      });
    }
  }

  /**
   * Get single prescription by ID
   * GET /api/igd/resep/detail/:resepId
   */
  async getResepById(req, res) {
    try {
      const { resepId } = req.params;

      const { data, error } = await supabase
        .from('resep_igd')
        .select(`
          *,
          created_by_profile:profiles!resep_igd_created_by_fkey (
            id,
            name,
            role
          )
        `)
        .eq('resep_id', parseInt(resepId))
        .eq('is_deleted', false)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Prescription fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching prescription:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch prescription',
        error: error.message
      });
    }
  }

  /**
   * Create new prescription
   * POST /api/igd/resep
   */
  async createResep(req, res) {
    try {
      const {
        encounter_id,
        resep_pulang,
        resep_type,
        items,
        notes
      } = req.body;

      // Validasi required fields
      if (!encounter_id) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Minimal satu item resep required'
        });
      }

      // Ambil user yang sedang login
      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      const resepData = {
        encounter_id: parseInt(encounter_id),
        resep_pulang: resep_pulang || false,
        resep_type: resep_type || 'REGULER',
        items: items,
        notes: notes || null,
        created_by: currentProfileId,
        created_at: new Date().toISOString(),
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('resep_igd')
        .insert([resepData])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: data,
        message: 'Prescription created successfully'
      });
    } catch (error) {
      console.error('Error creating prescription:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create prescription',
        error: error.message
      });
    }
  }

  /**
   * Update prescription
   * PUT /api/igd/resep/:resepId
   */
  async updateResep(req, res) {
    try {
      const { resepId } = req.params;
      const {
        resep_pulang,
        resep_type,
        items,
        notes
      } = req.body;

      // Cek apakah resep exists
      const { data: existingResep, error: checkError } = await supabase
        .from('resep_igd')
        .select('resep_id')
        .eq('resep_id', parseInt(resepId))
        .eq('is_deleted', false)
        .single();

      if (checkError || !existingResep) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      // Ambil user yang sedang login
      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      const updateData = {
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      if (resep_pulang !== undefined) updateData.resep_pulang = resep_pulang;
      if (resep_type) updateData.resep_type = resep_type;
      if (items) updateData.items = items;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('resep_igd')
        .update(updateData)
        .eq('resep_id', parseInt(resepId))
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Prescription updated successfully'
      });
    } catch (error) {
      console.error('Error updating prescription:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update prescription',
        error: error.message
      });
    }
  }

  /**
   * Delete prescription (soft delete)
   * DELETE /api/igd/resep/:resepId
   */
  async deleteResep(req, res) {
    try {
      const { resepId } = req.params;

      // Cek apakah resep exists
      const { data: existingResep, error: checkError } = await supabase
        .from('resep_igd')
        .select('resep_id')
        .eq('resep_id', parseInt(resepId))
        .eq('is_deleted', false)
        .single();

      if (checkError || !existingResep) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      // Ambil user yang sedang login
      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      // Soft delete
      const { error } = await supabase
        .from('resep_igd')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: currentProfileId,
          updated_by: currentProfileId,
          updated_at: new Date().toISOString()
        })
        .eq('resep_id', parseInt(resepId));

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Prescription deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting prescription:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete prescription',
        error: error.message
      });
    }
  }

  /**
   * Update blockchain hash for prescription
   * PATCH /api/igd/resep/:resepId/blockchain
   */
  async updateBlockchainHash(req, res) {
    try {
      const { resepId } = req.params;
      const {
        blockchain_tx_hash,
        blockchain_block_number,
        blockchain_timestamp
      } = req.body;

      if (!blockchain_tx_hash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required'
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      const updateData = {
        blockchain_tx_hash: blockchain_tx_hash,
        blockchain_block_number: blockchain_block_number || null,
        blockchain_timestamp: blockchain_timestamp || new Date().toISOString(),
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('resep_igd')
        .update(updateData)
        .eq('resep_id', parseInt(resepId))
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Blockchain hash updated successfully'
      });
    } catch (error) {
      console.error('Error updating blockchain hash:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update blockchain hash',
        error: error.message
      });
    }
  }
}

module.exports = new ResepController();