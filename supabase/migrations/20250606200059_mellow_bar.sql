/*
  # Crear post de blog de prueba

  1. Insertar datos de prueba
    - Un post de blog de ejemplo
    - Categorías y tags básicos
  
  2. Verificar que las políticas RLS funcionen correctamente
*/

-- Insertar categorías de ejemplo si no existen
INSERT INTO blog_categories (name, slug) 
VALUES 
  ('Tips', 'tips'),
  ('Destinos', 'destinos'),
  ('Rankings', 'rankings'),
  ('Consejos', 'consejos')
ON CONFLICT (slug) DO NOTHING;

-- Insertar tags de ejemplo si no existen
INSERT INTO blog_tags (name, slug)
VALUES 
  ('viajes', 'viajes'),
  ('consejos', 'consejos'),
  ('destinos', 'destinos'),
  ('turismo', 'turismo'),
  ('aventura', 'aventura')
ON CONFLICT (slug) DO NOTHING;

-- Insertar un post de blog de prueba
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  image_url,
  category,
  status,
  published_at
) VALUES (
  'Tips para viajar mejor',
  'tips-para-viajar-mejor',
  'Descubre los mejores consejos para hacer de tu próximo viaje una experiencia inolvidable.',
  E'Viajar es una de las experiencias más enriquecedoras que podemos vivir. Sin embargo, para que cada viaje sea realmente memorable, es importante estar bien preparado y conocer algunos trucos que pueden marcar la diferencia.\n\n## Planificación es clave\n\nAntes de partir, dedica tiempo a investigar tu destino. Conoce el clima, las costumbres locales, y los lugares que no te puedes perder. Una buena planificación te ahorrará tiempo y dinero durante el viaje.\n\n## Empaca inteligentemente\n\nLleva solo lo esencial y siempre ten una muda de ropa en tu equipaje de mano. Esto te salvará si tu maleta se retrasa o se pierde.\n\n## Mantente conectado pero desconéctate\n\nAsegúrate de tener comunicación, pero también date tiempo para desconectarte y disfrutar el momento presente.\n\n## Sé flexible\n\nLos mejores recuerdos de viaje a menudo vienen de los planes que no salieron como esperábamos. Mantén una mente abierta y disfruta las sorpresas que el camino te depare.',
  'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg',
  'Tips',
  'published',
  now()
) ON CONFLICT (slug) DO NOTHING;