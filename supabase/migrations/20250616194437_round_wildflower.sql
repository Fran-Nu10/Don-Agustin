/*
  # Agregar campo de valor del viaje a clientes

  1. Cambios
    - Agregar columna `trip_value` a la tabla clients
    - Establecer valor predeterminado en 0
    - Agregar comentario descriptivo
  
  2. Seguridad
    - Mantener las políticas RLS existentes
    - No se requieren cambios en permisos
*/

-- Agregar columna trip_value a la tabla clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS trip_value numeric DEFAULT 0;

-- Agregar comentario descriptivo
COMMENT ON COLUMN clients.trip_value IS 'Valor del viaje para este cliente (en pesos uruguayos)';