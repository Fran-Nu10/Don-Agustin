/*
  # Sistema de Reportes Financieros

  1. Nuevas Tablas
    - `bookings_revenue` - Registro de ingresos por reservas
    - `revenue_analytics` - Análisis de ingresos agregados
    - `sales_performance` - Rendimiento de ventas
    - `financial_metrics` - Métricas financieras históricas

  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas para admin users solamente

  3. Funciones
    - Triggers para calcular métricas automáticamente
    - Funciones de agregación de datos
*/

-- Tabla de ingresos por reservas
CREATE TABLE IF NOT EXISTS bookings_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'UYU',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  payment_date timestamptz,
  commission_rate numeric DEFAULT 0.10, -- 10% comisión por defecto
  commission_amount numeric GENERATED ALWAYS AS (amount * commission_rate) STORED,
  net_revenue numeric GENERATED ALWAYS AS (amount - (amount * commission_rate)) STORED,
  revenue_month integer GENERATED ALWAYS AS (EXTRACT(MONTH FROM COALESCE(payment_date, created_at))) STORED,
  revenue_year integer GENERATED ALWAYS AS (EXTRACT(YEAR FROM COALESCE(payment_date, created_at))) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de métricas financieras agregadas
CREATE TABLE IF NOT EXISTS financial_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  metric_type text NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  total_revenue numeric DEFAULT 0,
  total_bookings integer DEFAULT 0,
  average_booking_value numeric DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  leads_generated integer DEFAULT 0,
  revenue_growth_rate numeric DEFAULT 0,
  booking_growth_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(metric_date, metric_type)
);

-- Tabla de rendimiento por categoría de viaje
CREATE TABLE IF NOT EXISTS category_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  total_revenue numeric DEFAULT 0,
  total_bookings integer DEFAULT 0,
  average_price numeric DEFAULT 0,
  market_share numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category, month, year)
);

-- Tabla de análisis de fuentes de ingresos
CREATE TABLE IF NOT EXISTS revenue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL, -- 'website', 'referral', 'social_media', 'direct'
  month integer NOT NULL,
  year integer NOT NULL,
  revenue_amount numeric DEFAULT 0,
  booking_count integer DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  cost_per_acquisition numeric DEFAULT 0,
  roi numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_type, month, year)
);

-- Tabla de objetivos y metas
CREATE TABLE IF NOT EXISTS revenue_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  target_period text NOT NULL, -- '2024-01', '2024-Q1', '2024'
  revenue_target numeric NOT NULL,
  bookings_target integer NOT NULL,
  leads_target integer NOT NULL,
  conversion_target numeric NOT NULL,
  actual_revenue numeric DEFAULT 0,
  actual_bookings integer DEFAULT 0,
  actual_leads integer DEFAULT 0,
  actual_conversion numeric DEFAULT 0,
  achievement_rate numeric GENERATED ALWAYS AS (
    CASE 
      WHEN revenue_target > 0 THEN (actual_revenue / revenue_target) * 100
      ELSE 0
    END
  ) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(target_type, target_period)
);

-- Habilitar RLS
ALTER TABLE bookings_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_targets ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (solo admin users)
CREATE POLICY "Admin users can manage bookings revenue"
  ON bookings_revenue
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Admin users can view financial metrics"
  ON financial_metrics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Admin users can view category performance"
  ON category_performance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Admin users can manage revenue sources"
  ON revenue_sources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Admin users can manage revenue targets"
  ON revenue_targets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  );

-- Función para actualizar métricas automáticamente
CREATE OR REPLACE FUNCTION update_financial_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Actualizar métricas mensuales
  INSERT INTO financial_metrics (
    metric_date,
    metric_type,
    total_revenue,
    total_bookings,
    average_booking_value,
    leads_generated
  )
  SELECT 
    DATE_TRUNC('month', CURRENT_DATE)::date,
    'monthly',
    COALESCE(SUM(br.amount), 0),
    COUNT(DISTINCT br.booking_id),
    COALESCE(AVG(br.amount), 0),
    (SELECT COUNT(*) FROM clients WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE))
  FROM bookings_revenue br
  WHERE EXTRACT(MONTH FROM br.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM br.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
  ON CONFLICT (metric_date, metric_type) 
  DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_bookings = EXCLUDED.total_bookings,
    average_booking_value = EXCLUDED.average_booking_value,
    leads_generated = EXCLUDED.leads_generated;
END;
$$;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_revenue_updated_at
  BEFORE UPDATE ON bookings_revenue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_targets_updated_at
  BEFORE UPDATE ON revenue_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo para demostración
INSERT INTO bookings_revenue (booking_id, trip_id, amount, payment_status, payment_date, commission_rate)
SELECT 
  b.id,
  b.trip_id,
  t.price,
  'paid',
  b.created_at + INTERVAL '1 day',
  0.15
FROM bookings b
JOIN trips t ON b.trip_id = t.id
ON CONFLICT DO NOTHING;

-- Insertar objetivos de ejemplo
INSERT INTO revenue_targets (target_type, target_period, revenue_target, bookings_target, leads_target, conversion_target)
VALUES 
  ('monthly', '2024-12', 50000, 25, 100, 25.0),
  ('quarterly', '2024-Q4', 150000, 75, 300, 25.0),
  ('yearly', '2024', 600000, 300, 1200, 25.0)
ON CONFLICT DO NOTHING;

-- Actualizar métricas iniciales
SELECT update_financial_metrics();