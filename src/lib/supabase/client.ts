// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = '❌ Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.';
    console.error('Supabase Configuration Error:', errorMsg);
    console.log('Debug - URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('Debug - Key:', supabaseAnonKey ? 'SET' : 'NOT SET');
    return false;
  }

  if (supabaseUrl === 'your-supabase-project-url' || supabaseUrl.includes('your-supabase-project-url')) {
    console.error('🔧 Please update your .env file with actual Supabase credentials.');
    return false;
  }

  if (supabaseAnonKey === 'your-supabase-anon-key' || supabaseAnonKey.includes('your-supabase-anon-key')) {
    console.error('🔧 Please update your .env file with actual Supabase credentials.');
    return false;
  }

  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase')) {
      console.error('🌐 Invalid Supabase URL format.');
      return false;
    }
  } catch (urlError) {
    console.error('🌐 Invalid Supabase URL format.');
    return false;
  }

  if (supabaseAnonKey.length < 100 || !supabaseAnonKey.includes('.')) {
    console.error('🔑 Invalid Supabase anonymous key format.');
    return false;
  }

  return true;
}

let supabaseClient: any;

function initializeSupabase() {
  if (!supabaseClient) {
    const isValid = validateSupabaseConfig();

    if (!isValid || !supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase will be initialized with placeholder config. Check your .env file.');
      const placeholderUrl = 'https://placeholder.supabase.co';
      const placeholderKey = 'placeholder-key';

      supabaseClient = createClient(placeholderUrl, placeholderKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
          storage: localStorage,
        },
      });
    } else {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: localStorage,
        },
        global: {
          headers: {
            'apikey': supabaseAnonKey,
          },
          fetch: async (input, init) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.log('⏰ [SUPABASE FETCH] Aborting request after 60 seconds:', input);
              controller.abort();
            }, 60000);

            try {
              const startTime = performance.now();
              const response = await fetch(input, {
                ...init,
                signal: controller.signal,
              });
              const endTime = performance.now();

              const duration = endTime - startTime;
              if (duration > 5000) {
                console.warn(`🐌 [SUPABASE FETCH] Slow request detected: ${duration.toFixed(0)}ms for ${input}`);
              } else {
                console.log(`⚡ [SUPABASE FETCH] Request completed in ${duration.toFixed(0)}ms for ${input}`);
              }

              return response;
            } catch (error) {
              if (error.name === 'AbortError') {
                console.error('⏰ [SUPABASE FETCH] Request aborted due to timeout:', input);
                throw new Error('⏰ SUPABASE TIMEOUT: Request exceeded 60 seconds');
              }
              throw error;
            } finally {
              clearTimeout(timeoutId);
            }
          },
        },
      });
    }
  }
  return supabaseClient;
}

export const supabase = new Proxy({}, {
  get: (target, prop) => {
    return initializeSupabase()[prop];
  },
});

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