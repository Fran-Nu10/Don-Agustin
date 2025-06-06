/*
  # Agregar viajes de calidad por categoría

  1. Nuevos viajes
    - 1 viaje nacional: Punta del Diablo
    - 1 viaje internacional: Tailandia Exótico
    - 1 viaje grupal: Rusia Imperial

  2. Características
    - Viajes con itinerarios detallados
    - Servicios incluidos completos
    - Precios competitivos
    - Descripciones atractivas
*/

-- Insertar viaje nacional: Punta del Diablo
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
    'Punta del Diablo Bohemio',
    'Rocha, Uruguay',
    'Descubre el encanto bohemio de Punta del Diablo en un fin de semana mágico. Este pintoresco pueblo de pescadores te cautivará con sus playas vírgenes, atardeceres espectaculares y ambiente relajado. Disfruta de la gastronomía local, caminatas por la costa y la vida nocturna única de este destino imperdible.',
    18500,
    '2024-08-10T00:00:00Z',
    '2024-08-12T00:00:00Z',
    18,
    'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg',
    'nacional',
    now(),
    now()
  );

  -- Insertar itinerario
  INSERT INTO itinerary_days (trip_id, day, title, description) VALUES
    (trip_id, 1, 'Llegada y exploración', 'Llegada a Punta del Diablo, check-in en posada y primera exploración del pueblo. Tarde libre en Playa de los Pescadores y cena en restaurante local.'),
    (trip_id, 2, 'Playas y naturaleza', 'Mañana en Playa Grande, almuerzo frente al mar. Tarde de relax en Playa de la Viuda y caminata al atardecer por el Cerro de la Buena Vista.'),
    (trip_id, 3, 'Despedida', 'Último paseo por el pueblo, compras de artesanías locales y regreso a Montevideo.');

  -- Insertar servicios incluidos
  INSERT INTO included_services (trip_id, icon, title, description) VALUES
    (trip_id, 'Hotel', 'Alojamiento', '2 noches en posada con encanto'),
    (trip_id, 'Car', 'Transporte', 'Traslados ida y vuelta desde Montevideo'),
    (trip_id, 'Utensils', 'Gastronomía', 'Desayunos incluidos y cena de bienvenida'),
    (trip_id, 'Compass', 'Actividades', 'Caminatas guiadas y tiempo libre en playas');
END $$;

-- Insertar viaje internacional: Tailandia Exótico
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
    'Tailandia Exótico',
    'Bangkok, Tailandia',
    'Sumérgete en la magia de Tailandia en un viaje de 12 días que combina templos dorados, playas paradisíacas y una cultura milenaria. Desde los bulliciosos mercados de Bangkok hasta las cristalinas aguas de Phi Phi, vive una experiencia que despertará todos tus sentidos. Incluye vuelos, hoteles de lujo y excursiones únicas.',
    195000,
    '2024-10-20T00:00:00Z',
    '2024-11-01T00:00:00Z',
    14,
    'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg',
    'internacional',
    now(),
    now()
  );

  -- Insertar itinerario
  INSERT INTO itinerary_days (trip_id, day, title, description) VALUES
    (trip_id, 1, 'Llegada a Bangkok', 'Llegada al aeropuerto de Bangkok, traslado al hotel y primera exploración de la vibrante capital tailandesa.'),
    (trip_id, 2, 'Templos de Bangkok', 'Visita al Gran Palacio, Wat Pho y Wat Arun. Paseo en longtail boat por los canales de la ciudad.'),
    (trip_id, 3, 'Mercados flotantes', 'Excursión a los famosos mercados flotantes de Damnoen Saduak y Amphawa.'),
    (trip_id, 4, 'Vuelo a Chiang Mai', 'Traslado a Chiang Mai, la rosa del norte. Visita al templo Doi Suthep al atardecer.'),
    (trip_id, 5, 'Cultura del norte', 'Visita a aldeas tribales, interacción con elefantes en santuario ético y clases de cocina tailandesa.'),
    (trip_id, 6, 'Vuelo a Phuket', 'Traslado a Phuket, check-in en resort frente al mar y tarde libre en la playa.'),
    (trip_id, 7, 'Islas Phi Phi', 'Excursión de día completo a las famosas islas Phi Phi, snorkel y almuerzo en la playa.'),
    (trip_id, 8, 'Isla James Bond', 'Tour por la bahía de Phang Nga, visita a la isla James Bond y cuevas marinas en kayak.'),
    (trip_id, 9, 'Relax en Phuket', 'Día libre para disfrutar del resort, spa opcional y compras en Patong.'),
    (trip_id, 10, 'Regreso a Bangkok', 'Vuelo de regreso a Bangkok, última tarde de compras en centros comerciales modernos.'),
    (trip_id, 11, 'Vuelo de regreso', 'Traslado al aeropuerto y vuelo de regreso a Uruguay.'),
    (trip_id, 12, 'Llegada', 'Llegada a Montevideo con recuerdos inolvidables de Tailandia.');

  -- Insertar servicios incluidos
  INSERT INTO included_services (trip_id, icon, title, description) VALUES
    (trip_id, 'Plane', 'Vuelos', 'Vuelos internacionales y domésticos incluidos'),
    (trip_id, 'Hotel', 'Alojamiento', 'Hoteles 4-5 estrellas en todas las ciudades'),
    (trip_id, 'Car', 'Traslados', 'Todos los traslados y transporte terrestre'),
    (trip_id, 'Utensils', 'Comidas', 'Desayunos diarios y comidas especiales'),
    (trip_id, 'Compass', 'Excursiones', 'Todas las excursiones y entradas incluidas'),
    (trip_id, 'Users', 'Guía', 'Guía local especializado en español');
END $$;

-- Insertar viaje grupal: Rusia Imperial
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
    'Rusia Imperial Grupal',
    'Moscú, Rusia',
    'Descubre los tesoros de la Rusia Imperial en un viaje grupal de 14 días por Moscú y San Petersburgo. Explora el Kremlin, el Hermitage, palacios de los zares y la majestuosa arquitectura rusa. Incluye el famoso tren nocturno entre ciudades, espectáculos de ballet y degustaciones de vodka. Una experiencia cultural única con grupo reducido.',
    285000,
    '2024-09-15T00:00:00Z',
    '2024-09-29T00:00:00Z',
    16,
    'https://images.pexels.com/photos/753339/pexels-photo-753339.jpeg',
    'grupal',
    now(),
    now()
  );

  -- Insertar itinerario
  INSERT INTO itinerary_days (trip_id, day, title, description) VALUES
    (trip_id, 1, 'Llegada a Moscú', 'Llegada a Moscú, encuentro del grupo y cena de bienvenida con música tradicional rusa.'),
    (trip_id, 2, 'Plaza Roja y Kremlin', 'Visita guiada a la Plaza Roja, Catedral de San Basilio y tour completo del Kremlin.'),
    (trip_id, 3, 'Metro y Arbat', 'Recorrido por las estaciones más bellas del metro de Moscú y paseo por la calle Arbat.'),
    (trip_id, 4, 'Monasterios y palacios', 'Excursión al Monasterio de Sergiev Posad y visita al Palacio de Kolomenskoye.'),
    (trip_id, 5, 'Galería Tretyakov', 'Visita a la Galería Tretyakov y tarde libre para compras en GUM.'),
    (trip_id, 6, 'Tren nocturno', 'Experiencia única en el famoso tren nocturno Moscú-San Petersburgo.'),
    (trip_id, 7, 'Llegada a San Petersburgo', 'Llegada a San Petersburgo, city tour y visita a la Catedral de San Isaac.'),
    (trip_id, 8, 'Hermitage', 'Día completo en el Museo del Hermitage, una de las colecciones de arte más importantes del mundo.'),
    (trip_id, 9, 'Palacios imperiales', 'Excursión a Peterhof, el "Versalles ruso" con sus famosas fuentes.'),
    (trip_id, 10, 'Pushkin y Pavlovsk', 'Visita a los palacios de Catalina en Pushkin y el palacio de Pavlovsk.'),
    (trip_id, 11, 'Fortaleza y canales', 'Visita a la Fortaleza de Pedro y Pablo y paseo en barco por los canales.'),
    (trip_id, 12, 'Ballet en el Mariinsky', 'Noche especial con espectáculo de ballet en el Teatro Mariinsky.'),
    (trip_id, 13, 'Última exploración', 'Tiempo libre para últimas compras y visitas opcionales.'),
    (trip_id, 14, 'Regreso', 'Traslado al aeropuerto y vuelo de regreso a Uruguay.');

  -- Insertar servicios incluidos
  INSERT INTO included_services (trip_id, icon, title, description) VALUES
    (trip_id, 'Plane', 'Vuelos', 'Vuelos internacionales ida y vuelta'),
    (trip_id, 'Hotel', 'Alojamiento', 'Hoteles 4 estrellas en centro de las ciudades'),
    (trip_id, 'Train', 'Tren nocturno', 'Experiencia en tren nocturno Moscú-San Petersburgo'),
    (trip_id, 'Users', 'Guía experto', 'Guía especializado en historia rusa'),
    (trip_id, 'Ticket', 'Entradas', 'Todas las entradas a museos y palacios'),
    (trip_id, 'Utensils', 'Comidas', 'Pensión completa con especialidades rusas'),
    (trip_id, 'Star', 'Espectáculos', 'Ballet en Teatro Mariinsky incluido');
END $$;