// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('❌ Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  }

  if (supabaseUrl === 'your-supabase-project-url' || supabaseUrl.includes('your-supabase-project-url')) {
    throw new Error('🔧 Please update your .env file with actual Supabase credentials.');
  }

  if (supabaseAnonKey === 'your-supabase-anon-key' || supabaseAnonKey.includes('your-supabase-anon-key')) {
    throw new Error('🔧 Please update your .env file with actual Supabase credentials.');
  }

  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase')) {
      throw new Error('🌐 Invalid Supabase URL format.');
    }
  } catch (urlError) {
    throw new Error('🌐 Invalid Supabase URL format.');
  }

  if (supabaseAnonKey.length < 100 || !supabaseAnonKey.includes('.')) {
    throw new Error('🔑 Invalid Supabase anonymous key format.');
  }
}

try {
  validateSupabaseConfig();
} catch (error) {
  console.error('Supabase Configuration Error:', error);
  throw error;
}

let supabase;

if (!supabase) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: sessionStorage,
    },
    global: {
      headers: {
        'apikey': supabaseAnonKey,
      },
    },
  });
}

export { supabase };

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('trips').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
} 
