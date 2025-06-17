/*
  # Agregar nuevos viajes a la base de datos

  1. Nuevos viajes
    - 2 viajes nacionales: Punta del Este Exclusivo y Salto y Daymán Termal
    - 2 viajes internacionales: Islas Griegas Paradisíacas y Sudáfrica Safari y Ciudad
  
  2. Características
    - Viajes con itinerarios detallados
    - Servicios incluidos completos
    - Precios competitivos
    - Descripciones atractivas
*/

-- Insertar viaje nacional: Punta del Este Exclusivo
DO $$
DECLARE
  trip_id uuid := gen_random_uuid();
BEGIN
  -- Insertar el viaje
  INSERT INTO trips (
    id, title, destination, description, price, departure_date, return_date, 
    available_spots, image_url, category, created_at, updated_at
  ) VALUES (
    trip_id,
    'Punta del Este Exclusivo',
    'Maldonado, Uruguay',
    'Disfruta de un fin de semana de lujo en el balneario más prestigioso de Sudamérica. Recorre sus playas, casinos y restaurantes de primer nivel.',
    28500,
    '2024-11-15',
    '2024-11-17',
    10,
    'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg',
    'nacional',
    now(),
    now()
  );

  -- Insertar itinerario
  INSERT INTO itinerary_days (trip_id, day, title, description) VALUES
    (trip_id, 1, 'Llegada a Punta del Este', 'Check-in en hotel boutique y paseo por La Brava.'),
    (trip_id, 2, 'Recorrido completo', 'Visita a Casapueblo, La Mano, puerto y Gorlero.'),
    (trip_id, 3, 'Regreso con parada en José Ignacio', 'Brunch en José Ignacio y regreso a Montevideo.');

  -- Insertar servicios incluidos
  INSERT INTO included_services (trip_id, icon, title, description) VALUES
    (trip_id, 'Hotel', 'Alojamiento', '2 noches en hotel boutique 4 estrellas'),
    (trip_id, 'Utensils', 'Gastronomía', 'Desayunos gourmet y cena de bienvenida'),
    (trip_id, 'Car', 'Transporte', 'Traslados en vehículo premium');
END $$;

-- Insertar viaje nacional: Salto y Daymán Termal
DO $$
DECLARE
  trip_id uuid := gen_random_uuid();
BEGIN
  -- Insertar el viaje
  INSERT INTO trips (
    id, title, destination, description, price, departure_date, return_date, 
    available_spots, image_url, category, created_at, updated_at
  ) VALUES (
    trip_id,
    'Salto y Daymán Termal',
    'Salto, Uruguay',
    'Sumérgete en las aguas termales de Daymán y disfruta de la ciudad de Salto en un viaje de relax y bienestar para toda la familia.',
    19800,
    '2024-08-23',
    '2024-08-26',
    18,
    'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg',
    'nacional',
    now(),
    now()
  );

  -- Insertar itinerario
  INSERT INTO itinerary_days (trip_id, day, title, description) VALUES
    (trip_id, 1, 'Viaje a Salto', 'Salida desde Montevideo, llegada y check-in en hotel termal.'),
    (trip_id, 2, 'Termas de Daymán', 'Día completo en el parque acuático termal de Daymán.'),
    (trip_id, 3, 'City Tour Salto', 'Visita al centro de Salto, Represa de Salto Grande y tiempo libre.'),
    (trip_id, 4, 'Regreso', 'Mañana libre en las termas y regreso a Montevideo.');

  -- Insertar servicios incluidos
  INSERT INTO included_services (trip_id, icon, title, description) VALUES
    (trip_id, 'Hotel', 'Alojamiento', '3 noches en hotel con acceso a termas'),
    (trip_id, 'Bus', 'Transporte', 'Bus semicama con servicios a bordo'),
    (trip_id, 'Ticket', 'Entradas', 'Acceso ilimitado a parque acuático');
END $$;

-- Insertar viaje internacional: Islas Griegas Paradisíacas
DO $$
DECLARE
  trip_id uuid := gen_random_uuid();
BEGIN
  -- Insertar el viaje
  INSERT INTO trips (
    id, title, destination, description, price, departure_date, return_date, 
    available_spots, image_url, category, created_at, updated_at
  ) VALUES (
    trip_id,
    'Islas Griegas Paradisíacas',
    'Atenas, Grecia',
    'Recorre las islas más hermosas del Mar Egeo en un crucero de ensueño. Santorini, Mykonos, Creta y más te esperan en este viaje inolvidable por el Mediterráneo.',
    195000,
    '2024-06-10',
    '2024-06-20',
    14,
    'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg',
    'internacional',
    now(),
    now()
  );

  -- Insertar itinerario
  INSERT INTO itinerary_days (trip_id, day, title, description) VALUES
    (trip_id, 1, 'Llegada a Atenas', 'Recepción en el aeropuerto y traslado al hotel en el centro histórico.'),
    (trip_id, 2, 'Acrópolis y Plaka', 'Visita guiada a la Acrópolis, Partenón y paseo por el barrio de Plaka.'),
    (trip_id, 3, 'Embarque en crucero', 'Traslado al puerto del Pireo y embarque en crucero por las islas griegas.'),
    (trip_id, 4, 'Mykonos', 'Día completo en la cosmopolita isla de Mykonos.'),
    (trip_id, 5, 'Santorini', 'Visita a la espectacular isla de Santorini con sus casas blancas y azules.'),
    (trip_id, 6, 'Creta', 'Exploración de Heraklion y el Palacio de Knossos en Creta.'),
    (trip_id, 7, 'Rodas', 'Visita a la medieval ciudad de Rodas y sus playas.'),
    (trip_id, 8, 'Día de navegación', 'Disfrute de las instalaciones del crucero en día de navegación.'),
    (trip_id, 9, 'Regreso a Atenas', 'Desembarque y última noche en Atenas.'),
    (trip_id, 10, 'Regreso a Uruguay', 'Traslado al aeropuerto y vuelo de regreso.');

  -- Insertar servicios incluidos
  INSERT INTO included_services (trip_id, icon, title, description) VALUES
    (trip_id, 'Plane', 'Vuelos', 'Vuelos internacionales con tasas incluidas'),
    (trip_id, 'Hotel', 'Alojamiento', '2 noches en Atenas y 7 noches en crucero'),
    (trip_id, 'Ship', 'Crucero', 'Crucero en pensión completa por las islas'),
    (trip_id, 'Utensils', 'Comidas', 'Todas las comidas en el crucero incluidas'),
    (trip_id, 'Map', 'Excursiones', 'Excursiones en cada isla con guía en español');
END $$;

-- Insertar viaje internacional: Sudáfrica Safari y Ciudad
DO $$
DECLARE
  trip_id uuid := gen_random_uuid();
BEGIN
  -- Insertar el viaje
  INSERT INTO trips (
    id, title, destination, description, price, departure_date, return_date, 
    available_spots, image_url, category, created_at, updated_at
  ) VALUES (
    trip_id,
    'Sudáfrica Safari y Ciudad',
    'Ciudad del Cabo, Sudáfrica',
    'Combina la emoción de un safari en la sabana africana con la belleza de Ciudad del Cabo en este viaje único que te acercará a los "Big Five" y a paisajes impresionantes.',
    210000,
    '2024-09-25',
    '2024-10-05',
    12,
    'https://images.pexels.com/photos/33045/lion-wild-africa-african.jpg',
    'internacional',
    now(),
    now()
  );

  -- Insertar itinerario
  INSERT INTO itinerary_days (trip_id, day, title, description) VALUES
    (trip_id, 1, 'Vuelo a Johannesburgo', 'Salida desde Montevideo con destino a Johannesburgo.'),
    (trip_id, 2, 'Llegada a Johannesburgo', 'Recepción en el aeropuerto y traslado al hotel.'),
    (trip_id, 3, 'Parque Kruger', 'Traslado al Parque Nacional Kruger, check-in en lodge.'),
    (trip_id, 4, 'Safari matutino', 'Safari al amanecer para avistar los "Big Five".'),
    (trip_id, 5, 'Safari vespertino', 'Safari al atardecer y cena bajo las estrellas.'),
    (trip_id, 6, 'Vuelo a Ciudad del Cabo', 'Traslado al aeropuerto y vuelo a Ciudad del Cabo.'),
    (trip_id, 7, 'Table Mountain', 'Visita a Table Mountain y recorrido por la ciudad.'),
    (trip_id, 8, 'Cabo de Buena Esperanza', 'Excursión al Cabo de Buena Esperanza y colonia de pingüinos.'),
    (trip_id, 9, 'Ruta de los Vinos', 'Tour por la famosa región vinícola de Stellenbosch.'),
    (trip_id, 10, 'Regreso a Uruguay', 'Traslado al aeropuerto y vuelo de regreso.');

  -- Insertar servicios incluidos
  INSERT INTO included_services (trip_id, icon, title, description) VALUES
    (trip_id, 'Plane', 'Vuelos', 'Vuelos internacionales y domésticos'),
    (trip_id, 'Hotel', 'Alojamiento', 'Hoteles 4* y lodge de safari'),
    (trip_id, 'Car', 'Safaris', '4 safaris en vehículos 4x4 abiertos'),
    (trip_id, 'Utensils', 'Comidas', 'Desayunos diarios y pensión completa en safari'),
    (trip_id, 'Users', 'Guías', 'Guías especializados en español');
END $$;