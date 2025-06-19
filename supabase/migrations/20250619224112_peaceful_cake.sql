/*
  # Update client statistics calculation

  1. Changes
    - Add new function to calculate client statistics
    - Separate potential revenue from closed revenue
    - Track clients with value assigned
*/

-- Create or replace function to calculate client statistics
CREATE OR REPLACE FUNCTION calculate_client_statistics()
RETURNS json AS $$
DECLARE
  total_clients integer;
  potential_revenue numeric;
  closed_revenue numeric;
  clients_with_value integer;
  avg_trip_value numeric;
BEGIN
  -- Count total clients
  SELECT COUNT(*) INTO total_clients FROM clients;
  
  -- Calculate potential revenue (clients not closed or lost)
  SELECT COALESCE(SUM(trip_value), 0) INTO potential_revenue 
  FROM clients 
  WHERE status NOT IN ('cliente_cerrado', 'cliente_perdido');
  
  -- Calculate closed revenue (only clients with 'cliente_cerrado' status)
  SELECT COALESCE(SUM(trip_value), 0) INTO closed_revenue 
  FROM clients 
  WHERE status = 'cliente_cerrado';
  
  -- Count clients with value assigned
  SELECT COUNT(*) INTO clients_with_value 
  FROM clients 
  WHERE trip_value IS NOT NULL AND trip_value > 0;
  
  -- Calculate average trip value
  IF clients_with_value > 0 THEN
    SELECT COALESCE(AVG(trip_value), 0) INTO avg_trip_value 
    FROM clients 
    WHERE trip_value IS NOT NULL AND trip_value > 0;
  ELSE
    avg_trip_value := 0;
  END IF;
  
  -- Return JSON with statistics
  RETURN json_build_object(
    'total_clients', total_clients,
    'potential_revenue', potential_revenue,
    'closed_revenue', closed_revenue,
    'clients_with_value', clients_with_value,
    'avg_trip_value', avg_trip_value
  );
END;
$$ LANGUAGE plpgsql;