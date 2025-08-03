import { useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export function useSessionManager() {
  useEffect(() => {
    const recoverSession = async () => {
      console.log('🔁 Intentando recuperar sesión desde Supabase...');
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.warn('⚠️ Error al recuperar sesión:', error);
        return;
      }

      if (!session) {
        console.log('⚠️ No hay sesión activa en esta pestaña.');
      } else {
        console.log('✅ Sesión activa recuperada:', session.user.email);
      }
    };

    recoverSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🟡 Evento de cambio de sesión:', event);
      if (event === 'SIGNED_IN') {
        console.log('🔐 Sesión iniciada:', session?.user.email);
      }
      if (event === 'SIGNED_OUT') {
        console.log('🔓 Sesión cerrada.');
      }
    });

    // 🔄 Limpiar sesión al cerrar pestaña
    const handleBeforeUnload = async () => {
      try {
        console.log('🧹 Cerrando sesión al cerrar pestaña...');
        await supabase.auth.signOut();
        localStorage.removeItem('supabase.auth.token'); // Precaución extra
      } catch (error) {
        console.warn('⚠️ Error al limpiar sesión:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
