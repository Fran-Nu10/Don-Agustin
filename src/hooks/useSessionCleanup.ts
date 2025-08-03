import { useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export function useSessionCleanup() {
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        console.log('🧹 Cerrando sesión antes de cerrar la pestaña...');
        await supabase.auth.signOut();

        // Eliminamos manualmente el token de localStorage por si persiste
        localStorage.removeItem('supabase.auth.token');
      } catch (error) {
        console.warn('⚠️ Error al cerrar sesión al cerrar pestaña:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
