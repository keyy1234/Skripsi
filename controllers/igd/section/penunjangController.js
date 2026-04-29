// src/controllers/igd/section/penunjangController.js
const { supabase } = require('../../../config/supabase');

class PenunjangController {
  /**
   * Get all diagnostic tests by encounter ID
   * GET /api/igd/penunjang/:encounterId
   */
  async getTestsByEncounter(req, res) {
    try {
      const { encounterId } = req.params;

      if (!encounterId) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
      }

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .select(`
          *,
          requested_by_profile:profiles!diagnostic_tests_requested_by_fkey (
            id,
            name,
            role,
            specialization
          ),
          processed_by_profile:profiles!diagnostic_tests_processed_by_fkey (
            id,
            name,
            role
          ),
          created_by_profile:profiles!diagnostic_tests_created_by_fkey (
            id,
            name
          ),
          updated_by_profile:profiles!diagnostic_tests_updated_by_fkey (
            id,
            name
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .order('requested_at', { ascending: false });

      if (error) throw error;

      // Transform data untuk frontend (agar konsisten dengan命名 frontend)
      const transformedData = (data || []).map(item => ({
        ...item,
        requested_by_staff: item.requested_by_profile,
        processed_by_staff: item.processed_by_profile,
        created_by_staff: item.created_by_profile,
        updated_by_staff: item.updated_by_profile
      }));

      return res.status(200).json({
        success: true,
        data: transformedData,
        message: 'Diagnostic tests fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching diagnostic tests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch diagnostic tests',
        error: error.message
      });
    }
  }

  /**
   * Get single diagnostic test by ID
   * GET /api/igd/penunjang/detail/:testId
   */
  async getTestById(req, res) {
    try {
      const { testId } = req.params;

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .select(`
          *,
          requested_by_profile:profiles!diagnostic_tests_requested_by_fkey (
            id,
            name,
            role,
            specialization
          ),
          processed_by_profile:profiles!diagnostic_tests_processed_by_fkey (
            id,
            name,
            role
          )
        `)
        .eq('test_id', parseInt(testId))
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Diagnostic test not found'
        });
      }

      // Transform data
      const transformedData = {
        ...data,
        requested_by_staff: data.requested_by_profile,
        processed_by_staff: data.processed_by_profile
      };

      return res.status(200).json({
        success: true,
        data: transformedData,
        message: 'Diagnostic test fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching diagnostic test:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch diagnostic test',
        error: error.message
      });
    }
  }

  /**
   * Create new diagnostic test
   * POST /api/igd/penunjang
   */
  async createTest(req, res) {
    try {
      const {
        encounter_id,
        test_type,
        test_name,
        requested_by,
        requested_at,
        notes
      } = req.body;

      // Validasi required fields
      if (!encounter_id) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
      }

      if (!test_type) {
        return res.status(400).json({
          success: false,
          message: 'Test type is required'
        });
      }

      if (!test_name) {
        return res.status(400).json({
          success: false,
          message: 'Test name is required'
        });
      }

      if (!requested_by) {
        return res.status(400).json({
          success: false,
          message: 'Requested by (dokter peminta) is required'
        });
      }

      // Validasi test_type
      const validTestTypes = ['LAB', 'RADIOLOGY', 'ECG', 'USG', 'MRI', 'CT_SCAN', 'OTHER'];
      if (!validTestTypes.includes(test_type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid test type. Must be one of: ${validTestTypes.join(', ')}`
        });
      }

      // Ambil user yang sedang login
      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      const testData = {
        encounter_id: parseInt(encounter_id),
        test_type: test_type,
        test_name: test_name,
        status: 'REQUESTED',
        requested_by: requested_by, // UUID dari profiles
        requested_at: requested_at || new Date().toISOString(),
        notes: notes || null,
        created_by: currentProfileId,
        created_at: new Date().toISOString(),
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .insert([testData])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: data,
        message: 'Diagnostic test created successfully'
      });
    } catch (error) {
      console.error('Error creating diagnostic test:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create diagnostic test',
        error: error.message
      });
    }
  }

  /**
   * Update diagnostic test
   * PUT /api/igd/penunjang/:testId
   */
  async updateTest(req, res) {
    try {
      const { testId } = req.params;
      const {
        test_type,
        test_name,
        status,
        notes
      } = req.body;

      // Cek apakah test exists
      const { data: existingTest, error: checkError } = await supabase
        .from('diagnostic_tests')
        .select('test_id')
        .eq('test_id', parseInt(testId))
        .single();

      if (checkError || !existingTest) {
        return res.status(404).json({
          success: false,
          message: 'Diagnostic test not found'
        });
      }

      // Ambil user yang sedang login
      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      // Prepare update data
      const updateData = {
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      if (test_type) updateData.test_type = test_type;
      if (test_name) updateData.test_name = test_name;
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .update(updateData)
        .eq('test_id', parseInt(testId))
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Diagnostic test updated successfully'
      });
    } catch (error) {
      console.error('Error updating diagnostic test:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update diagnostic test',
        error: error.message
      });
    }
  }

  /**
   * Update test status
   * PATCH /api/igd/penunjang/:testId/status
   */
  async updateStatus(req, res) {
    try {
      const { testId } = req.params;
      const { status } = req.body;

      const validStatuses = ['REQUESTED', 'COLLECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      const updateData = {
        status: status,
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      if (status === 'COLLECTED') {
        updateData.collected_at = new Date().toISOString();
      }
      if (status === 'PROCESSING') {
        updateData.processed_at = new Date().toISOString();
      }
      if (status === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString();
        updateData.processed_by = currentProfileId;
      }

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .update(updateData)
        .eq('test_id', parseInt(testId))
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: `Test status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating test status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update test status',
        error: error.message
      });
    }
  }

  /**
   * Save test result
   * POST /api/igd/penunjang/:testId/result
   */
  async saveResult(req, res) {
    try {
      const { testId } = req.params;
      const { result } = req.body;

      if (!result) {
        return res.status(400).json({
          success: false,
          message: 'Result is required'
        });
      }

      const currentUser = req.user;
      const currentProfileId = currentUser?.id;

      let resultJson;
      try {
        resultJson = typeof result === 'string' ? JSON.parse(result) : result;
      } catch {
        resultJson = { result: result };
      }

      const updateData = {
        result: resultJson,
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        processed_by: currentProfileId,
        updated_by: currentProfileId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .update(updateData)
        .eq('test_id', parseInt(testId))
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Test result saved successfully'
      });
    } catch (error) {
      console.error('Error saving test result:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save test result',
        error: error.message
      });
    }
  }

  /**
   * Delete diagnostic test
   * DELETE /api/igd/penunjang/:testId
   */
  async deleteTest(req, res) {
    try {
      const { testId } = req.params;

      const { error } = await supabase
        .from('diagnostic_tests')
        .delete()
        .eq('test_id', parseInt(testId));

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Diagnostic test deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting diagnostic test:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete diagnostic test',
        error: error.message
      });
    }
  }

  /**
   * Get tests by type (LAB or RADIOLOGY)
   * GET /api/igd/penunjang/by-type/:encounterId/:type
   */
  async getTestsByType(req, res) {
    try {
      const { encounterId, type } = req.params;

      if (!encounterId || !type) {
        return res.status(400).json({
          success: false,
          message: 'Encounter ID and type are required'
        });
      }

      const validTypes = ['LAB', 'RADIOLOGY', 'ECG', 'USG', 'MRI', 'CT_SCAN', 'OTHER'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
        });
      }

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .select(`
          *,
          requested_by_profile:profiles!diagnostic_tests_requested_by_fkey (
            id,
            name,
            role
          )
        `)
        .eq('encounter_id', parseInt(encounterId))
        .eq('test_type', type)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || [],
        message: `Tests for type ${type} fetched successfully`
      });
    } catch (error) {
      console.error('Error fetching tests by type:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tests',
        error: error.message
      });
    }
  }

  /**
   * Get pending tests (not completed)
   * GET /api/igd/penunjang/pending/:encounterId
   */
  async getPendingTests(req, res) {
    try {
      const { encounterId } = req.params;

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .select('*')
        .eq('encounter_id', parseInt(encounterId))
        .neq('status', 'COMPLETED')
        .neq('status', 'CANCELLED')
        .order('requested_at', { ascending: true });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || [],
        message: 'Pending tests fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching pending tests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch pending tests',
        error: error.message
      });
    }
  }

  /**
   * Get completed tests
   * GET /api/igd/penunjang/completed/:encounterId
   */
  async getCompletedTests(req, res) {
    try {
      const { encounterId } = req.params;

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .select('*')
        .eq('encounter_id', parseInt(encounterId))
        .eq('status', 'COMPLETED')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || [],
        message: 'Completed tests fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching completed tests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch completed tests',
        error: error.message
      });
    }
  }

  /**
   * Get test statistics for an encounter
   * GET /api/igd/penunjang/stats/:encounterId
   */
  async getTestStats(req, res) {
    try {
      const { encounterId } = req.params;

      const { data, error } = await supabase
        .from('diagnostic_tests')
        .select('test_type, status')
        .eq('encounter_id', parseInt(encounterId));

      if (error) throw error;

      const stats = {
        total: data.length,
        byType: {},
        byStatus: {
          REQUESTED: 0,
          COLLECTED: 0,
          PROCESSING: 0,
          COMPLETED: 0,
          CANCELLED: 0
        }
      };

      data.forEach(test => {
        stats.byType[test.test_type] = (stats.byType[test.test_type] || 0) + 1;
        stats.byStatus[test.status] = (stats.byStatus[test.status] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        data: stats,
        message: 'Test statistics fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching test stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch test statistics',
        error: error.message
      });
    }
  }
}

module.exports = new PenunjangController();