He habilitado la persistencia de sesión en Supabase cambiando persistSession de false a true, manteniendo sessionStorage como el mecanismo de almacenamiento.

¿Qué hace este cambio?

Persistencia dentro de la pestaña: La sesión ahora sobrevivirá a refrescos de página y navegación dentro de la misma pestaña
Limpieza automática: Al usar sessionStorage, la sesión se eliminará automáticamente cuando cierres la pestaña
Seguridad mejorada: Supabase guardará los tokens sensibles en IndexedDB (más seguro) y solo los metadatos en sessionStorage
Auto-refresh: Los tokens se refrescarán automáticamente antes de expirar
Esto debería resolver los problemas de "bloqueo" que experimentabas al cambiar de pestaña o después de interacciones como descargar PDFs, mientras mantiene la limpieza automática de la sesión que deseas.