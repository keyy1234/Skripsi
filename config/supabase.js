const { createClient } = require('@supabase/supabase-js');

// Gunakan environment variable atau hardcode
const supabaseUrl = process.env.SUPABASE_URL || 'https://gquzycgxrtrdhesexfvb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXp5Y2d4cnRyZGhlc2V4ZnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTUwODksImV4cCI6MjA5MDk3MTA4OX0.7BLawFJIs6PkqZRwuNwUC0QGJBxA51V441KjKSrH__Q';

console.log('✅ Supabase URL:', supabaseUrl ? 'Ada' : 'TIDAK ADA');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase };