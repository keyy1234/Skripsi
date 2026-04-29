const { supabase } = require('../config/supabase');

// ============================================
// CREATE - Registrasi pasien baru
// ============================================
const createPasien = async (req, res) => {
  try {
    const {
      nik,
      bpjsNumber,
      name,
      familyName,
      givenName,
      prefix,
      suffix,
      gender,
      birthDate,
      maritalStatusCode,
      maritalStatusDisplay,
      multipleBirthBoolean,
      phone,
      email,
      addressLine,
      addressCity,
      addressPostalCode,
      addressCountry,
      provinceCode,
      cityCode,
      districtCode,
      villageCode,
      rt,
      rw,
      contactName,
      contactRelationship,
      contactPhone,
      contactGender,
      contactAddress,
      languageCode,
      languageDisplay
    } = req.body;
    
    console.log('📝 Registrasi pasien baru oleh:', req.user.userId);
    
    // Validasi required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap wajib diisi'
      });
    }
    
    if (!gender) {
      return res.status(400).json({
        success: false,
        message: 'Jenis kelamin wajib dipilih'
      });
    }
    
    if (!birthDate) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal lahir wajib diisi'
      });
    }
    
    // Validasi NIK (16 digit)
    if (nik && nik.length !== 16) {
      return res.status(400).json({
        success: false,
        message: 'NIK harus 16 digit angka'
      });
    }
    
    // Validasi BPJS (13 digit)
    if (bpjsNumber && bpjsNumber.length !== 13) {
      return res.status(400).json({
        success: false,
        message: 'Nomor BPJS harus 13 digit angka'
      });
    }
    
    // Validasi email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }
    
    // Validasi nomor telepon
    if (phone && (phone.length < 10 || phone.length > 15)) {
      return res.status(400).json({
        success: false,
        message: 'Nomor telepon harus 10-15 digit'
      });
    }
    
    // Data yang akan disimpan
    const patientData = {
      nik: nik || null,
      bpjs_number: bpjsNumber || null,
      name: name,
      family_name: familyName || null,
      given_name: givenName || null,
      prefix: prefix || null,
      suffix: suffix || null,
      gender: gender,
      birth_date: birthDate,
      marital_status_code: maritalStatusCode || null,
      marital_status_display: maritalStatusDisplay || null,
      multiple_birth: multipleBirthBoolean || false,
      phone: phone || null,
      email: email || null,
      address_line: addressLine || null,
      address_city: addressCity || null,
      address_postal_code: addressPostalCode || null,
      address_country: addressCountry || 'ID',
      province_code: provinceCode || null,
      city_code: cityCode || null,
      district_code: districtCode || null,
      village_code: villageCode || null,
      rt: rt || null,
      rw: rw || null,
      contact_name: contactName || null,
      contact_relationship: contactRelationship || null,
      contact_phone: contactPhone || null,
      contact_gender: contactGender || null,
      contact_address: contactAddress || null,
      language_code: languageCode || 'id-ID',
      language_display: languageDisplay || 'Indonesian',
      created_by: req.user.id,
      created_at: new Date()
    };
    
    console.log('💾 Menyimpan data pasien:', { name, nik, bpjsNumber });
    
    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('pasien')
      .insert([patientData])
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      
      // Handle duplicate error
      if (error.code === '23505') {
        if (error.message.includes('nik')) {
          return res.status(409).json({
            success: false,
            message: 'NIK sudah terdaftar'
          });
        }
        if (error.message.includes('bpjs_number')) {
          return res.status(409).json({
            success: false,
            message: 'Nomor BPJS sudah terdaftar'
          });
        }
      }
      
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan data: ' + error.message
      });
    }
    
    console.log('✅ Registrasi berhasil! ID:', data[0]?.id);
    
    res.status(201).json({
      success: true,
      message: 'Registrasi pasien berhasil',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Create pasien error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan: ' + error.message
    });
  }
};

// ============================================
// READ - Get all pasien (dengan pagination & search)
// ============================================
const getAllPasien = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('pasien')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Filter pencarian
    if (search) {
      query = query.ilike('name', `%${search}%`);
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
    console.error('Get all pasien error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// READ - Get pasien by ID
// ============================================
const getPasienById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('pasien')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Pasien tidak ditemukan'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get pasien by id error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE - Update data pasien
// ============================================
const updatePasien = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah pasien ada
    const { data: existingPasien, error: findError } = await supabase
      .from('pasien')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingPasien) {
      return res.status(404).json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }
    
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    // Hapus field yang tidak boleh diupdate
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;
    
    const { data, error } = await supabase
      .from('pasien')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Data pasien berhasil diupdate',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Update pasien error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// DELETE - Hapus pasien
// ============================================
const deletePasien = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah pasien ada
    const { data: existingPasien, error: findError } = await supabase
      .from('pasien')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingPasien) {
      return res.status(404).json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }
    
    const { error } = await supabase
      .from('pasien')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Data pasien berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete pasien error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPasien,
  getAllPasien,
  getPasienById,
  updatePasien,
  deletePasien
};