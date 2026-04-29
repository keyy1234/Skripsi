import { createClient } from '@supabase/supabase-js'

// Hardcode dulu untuk testing (sampai env terbaca)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gquzycgxrtrdhesexfvb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXp5Y2d4cnRyZGhlc2V4ZnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTUwODksImV4cCI6MjA5MDk3MTA4OX0.7BLawFJIs6PkqZRwuNwUC0QGJBxA51V441KjKSrH__Q'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)