import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation for environment variables
function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('❌ Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  }

  // Check if the URL is still a placeholder
  if (supabaseUrl === 'your-supabase-project-url' || supabaseUrl.includes('your-supabase-project-url')) {
    throw new Error('🔧 Please update your .env file with actual Supabase credentials. Click "Connect to Supabase" in the top right to set up your project.');
  }

  if (supabaseAnonKey === 'your-supabase-anon-key' || supabaseAnonKey.includes('your-supabase-anon-key')) {
    throw new Error('🔧 Please update your .env file with actual Supabase credentials. Click "Connect to Supabase" in the top right to set up your project.');
  }

  // Validate URL format
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase')) {
      throw new Error('🌐 Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in the .env file.');
    }
  } catch (urlError) {
    throw new Error('🌐 Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in the .env file.');
  }

  // Validate anon key format (should be a JWT-like string)
  if (supabaseAnonKey.length < 100 || !supabaseAnonKey.includes('.')) {
    throw new Error('🔑 Invalid Supabase anonymous key format. Please check your VITE_SUPABASE_ANON_KEY in the .env file.');
  }
}

// Validate configuration before creating client
try {
  validateSupabaseConfig();
} catch (error) {
  console.error('Supabase Configuration Error:', error);
  throw error;
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
});