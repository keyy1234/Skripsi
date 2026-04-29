// hooks/useIGDData.js
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export const useIGDData = () => {
  const [encounters, setEncounters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEncounters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('encounters')
        .select(`
          encounter_id,
          status,
          encounter_start_time,
          encounter_end_time,
          chief_complaint,
          triage_level,
          responsible_staff_id,
          created_at,
          patients!encounters_patient_id_fkey (
            patient_id,
            patient_name,
            nik,
            gender,
            phone_number,
            date_of_birth,
            blood_type,
            emergency_contact_name,
            emergency_contact_phone,
            patient_history_of_allergies,
            patient_disease_history
          ),
          medic_staff!encounters_responsible_staff_id_fkey (
            staff_id,
            staff_name,
            specialization
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEncounters(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal mengambil data IGD');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, []);

  return { encounters, isLoading, error, refetch: fetchEncounters };
};