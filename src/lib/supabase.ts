import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jtuocqnvrvcfzplxbvvp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rtej9vAz7SDsywJcPfc0jQ_hXEKDPuM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey;
};
