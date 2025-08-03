import { useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface UseCrossTabSessionSyncProps {
  setUser: (user: any) => void;
}

export function useCrossTabSessionSync({ setUser }: UseCrossTabSessionSyncProps) {
  useEffect(() => {
    const handleStorage = async (event: StorageEvent) => {
      // Listen for changes to Supabase auth token
      if (event.key && event.key.includes('supabase.auth.token')) {
        const perfStart = performance.now();
        console.log('🧭 [CROSS TAB SYNC] Detected token change from another tab');
        console.log('🔍 [CROSS TAB SYNC] Event details:', {
          key: event.key,
          oldValue: event.oldValue ? 'exists' : 'null',
          newValue: event.newValue ? 'exists' : 'null',
          url: event.url
        });
        
        try {
          // If token was removed (logout in another tab)
          if (event.newValue === null) {
            console.log('🚪 [CROSS TAB SYNC] Token removed - user logged out in another tab');
            setUser(null);
            const perfEnd = performance.now();
            console.log(`📊 [CROSS TAB SYNC] Logout sync completed in ${(perfEnd - perfStart).toFixed(1)}ms`);
            return;
          }

          // If token was added or updated (login/refresh in another tab)
          console.log('🔄 [CROSS TAB SYNC] Token updated - syncing user state...');
          const { data, error } = await supabase.auth.getUser();

          if (error) {
            console.warn('❌ [CROSS TAB SYNC] Failed to get user after token change:', error);
            setUser(null);
            return;
          }

          if (data.user) {
            console.log('✅ [CROSS TAB SYNC] User synced from another tab:', data.user.email);
            
            // Get full user data from our users table
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', data.user.id)
              .single();

            if (userError) {
              console.warn('⚠️ [CROSS TAB SYNC] Could not fetch user data from users table:', userError);
              // Still set the basic user data
              setUser({
                id: data.user.id,
                email: data.user.email || '',
                role: 'employee',
                created_at: new Date().toISOString()
              });
            } else {
              setUser(userData);
            }
          } else {
            console.log('⚠️ [CROSS TAB SYNC] No user found after token change');
            setUser(null);
          }
          
          const perfEnd = performance.now();
          console.log(`📊 [CROSS TAB SYNC] User sync completed in ${(perfEnd - perfStart).toFixed(1)}ms`);
        } catch (err) {
          const perfEnd = performance.now();
          console.error('⚠️ [CROSS TAB SYNC] Error syncing session from other tab:', err);
          console.log(`📊 [CROSS TAB SYNC] Failed sync attempt took ${(perfEnd - perfStart).toFixed(1)}ms`);
          // Don't set user to null here - keep current state in case of temporary network issues
        }
      }
    };

    console.log('🧭 [CROSS TAB SYNC] Setting up cross-tab session synchronization');
    window.addEventListener('storage', handleStorage);
    
    return () => {
      console.log('🧹 [CROSS TAB SYNC] Cleaning up cross-tab session synchronization');
      window.removeEventListener('storage', handleStorage);
    };
  }, [setUser]);
}