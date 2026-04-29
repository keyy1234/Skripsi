const { supabase } = require('../config/supabase');

// Generate nomor registrasi otomatis
const generateNoRegistrasi = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RI${year}${month}${day}${random}`;
};

// CREATE - Admisi rawat inap baru
const createAdmisi = async (req, res) => {
  try {
    const {
      patient_id,
      no_rm,
      jenis_pasien,
      pasien_bpjs,
      penjamin_1,
      penjamin_2,
      no_peserta_1,
      no_peserta_2,
      no_sep,
      dikirim_oleh,
      dokter_penerima,
      diterima_melalui,
      tanggal_masuk,
      spesialisasi,
      dpjp,
      nama_kamar,
      tempat_tidur
    } = req.body;

    console.log('📝 Admisi rawat inap baru oleh:', req.user.userId);

    // Validasi required fields
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Data pasien tidak ditemukan'
      });
    }

    if (!tanggal_masuk) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal masuk wajib diisi'
      });
    }

    // Generate nomor registrasi unik
    const noRegistrasi = generateNoRegistrasi();

    // Data yang akan disimpan
    const admisiData = {
      patient_id: patient_id,
      no_rm: no_rm || null,
      no_registrasi: noRegistrasi,
      jenis_pasien: jenis_pasien || 'umum',
      pasien_bpjs: pasien_bpjs || null,
      penjamin_1: penjamin_1 !== '-- Silakan Pilih --' ? penjamin_1 : null,
      penjamin_2: penjamin_2 !== '-- Silakan Pilih --' ? penjamin_2 : null,
      no_peserta_1: no_peserta_1 || null,
      no_peserta_2: no_peserta_2 || null,
      no_sep: no_sep || null,
      dikirim_oleh: dikirim_oleh !== '-- Silakan Pilih --' ? dikirim_oleh : null,
      dokter_penerima: dokter_penerima || null,
      diterima_melalui: diterima_melalui || null,
      tanggal_masuk: tanggal_masuk,
      spesialisasi: spesialisasi !== '-- Silakan Pilih Spesialisasi --' ? spesialisasi : null,
      dpjp: dpjp !== '-- Silakan Pilih DPJP --' ? dpjp : null,
      nama_kamar: nama_kamar !== '-- Silakan Pilih --' ? nama_kamar : null,
      tempat_tidur: tempat_tidur !== '-- Silakan Pilih Kamar --' ? tempat_tidur : null,
      status: 'aktif',
      created_by: req.user.id,
      created_at: new Date()
    };

    console.log('💾 Menyimpan data admisi:', { noRegistrasi, patient_id });

    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('admisi_rawat_inap')
      .insert([admisiData])
      .select(`
        *,
        pasien:patient_id (
          id,
          name,
          nik,
          bpjs_number,
          phone,
          address_line
        )
      `);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan data: ' + error.message
      });
    }

    console.log('✅ Admisi berhasil! No Registrasi:', noRegistrasi);

    res.status(201).json({
      success: true,
      message: 'Admisi rawat inap berhasil',
      data: data[0]
    });

  } catch (error) {
    console.error('Create admisi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan: ' + error.message
    });
  }
};

// READ - Get all admisi
const getAllAdmisi = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('admisi_rawat_inap')
      .select(`
        *,
        pasien:patient_id (
          id,
          name,
          nik,
          bpjs_number,
          phone,
          address_line,
          gender,
          birth_date
        )
      `, { count: 'exact' })
      .order('tanggal_masuk', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Filter status
    if (status) {
      query = query.eq('status', status);
    }
    
    // Filter pencarian
    if (search) {
      query = query.or(`no_registrasi.ilike.%${search}%,no_rm.ilike.%${search}%`);
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
    console.error('Get all admisi error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// READ - Get admisi by ID
const getAdmisiById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('admisi_rawat_inap')
      .select(`
        *,
        pasien:patient_id (
          id,
          name,
          nik,
          bpjs_number,
          phone,
          address_line,
          gender,
          birth_date,
          email
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Data admisi tidak ditemukan'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get admisi by id error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// READ - Get admisi by patient
const getAdmisiByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const { data, error } = await supabase
      .from('admisi_rawat_inap')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'aktif')
      .order('tanggal_masuk', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get admisi by patient error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE - Update status admisi (pulang/pindah kamar)
const updateAdmisiStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tanggal_keluar, keterangan } = req.body;
    
    // Cek apakah admisi ada
    const { data: existingAdmisi, error: findError } = await supabase
      .from('admisi_rawat_inap')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingAdmisi) {
      return res.status(404).json({
        success: false,
        message: 'Data admisi tidak ditemukan'
      });
    }
    
    const updateData = {
      status: status,
      updated_at: new Date()
    };
    
    if (tanggal_keluar) {
      updateData.tanggal_keluar = tanggal_keluar;
    }
    
    if (keterangan) {
      updateData.keterangan = keterangan;
    }
    
    const { data, error } = await supabase
      .from('admisi_rawat_inap')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: `Status admisi berhasil diubah menjadi ${status}`,
      data: data[0]
    });
    
  } catch (error) {
    console.error('Update admisi status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE - Hapus admisi
const deleteAdmisi = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('admisi_rawat_inap')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Data admisi berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete admisi error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createAdmisi,
  getAllAdmisi,
  getAdmisiById,
  getAdmisiByPatient,
  updateAdmisiStatus,
  deleteAdmisi
};