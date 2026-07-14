import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if variables are missing
const isMissingVars = !supabaseUrl || !supabaseAnonKey;

if (isMissingVars) {
  console.error('Missing Supabase environment variables. Please check your Vercel settings.');
}

// Create client with dummy values if missing to prevent startup crash
// The UI will handle showing the error message
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export const SUPABASE_CONFIG_ERROR = isMissingVars;
