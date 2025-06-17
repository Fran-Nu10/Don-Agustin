import { User, Trip, Booking, Stats, BlogPost } from '../types';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    email: 'owner@donagustinviajes.com.uy',
    role: 'owner',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'employee@donagustinviajes.com.uy',
    role: 'employee',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock Trips
export const trips: Trip[] = [
  // Nacional - 6 viajes
  {
    id: '1',
    title: 'Termas de Guaviyú',
    destination: 'Paysandú, Uruguay',
    description: 'Disfruta de un fin de semana relajante en las termas de Guaviyú. Incluye alojamiento en bungalows y acceso a todas las piscinas termales.',
    price: 12000,
    departure_date: '2024-07-05T00:00:00Z',
    return_date: '2024-07-07T00:00:00Z',
    available_spots: 20,
    image_url: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'nacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Guaviyú',
        description: 'Check-in en los bungalows y tarde libre en las piscinas.',
      },
      {
        day: 2,
        title: 'Día de termas',
        description: 'Día completo para disfrutar de las instalaciones termales.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: '2 noches en bungalow equipado',
      },
      {
        icon: 'Waves',
        title: 'Acceso a termas',
        description: 'Acceso ilimitado a todas las piscinas',
      }
    ]
  },
  {
    id: '2',
    title: 'Cabo Polonio Aventura',
    destination: 'Rocha, Uruguay',
    description: 'Escapada de 3 días al místico Cabo Polonio. Vive la experiencia única de este pueblo sin electricidad, rodeado de dunas y mar.',
    price: 15000,
    departure_date: '2024-08-15T00:00:00Z',
    return_date: '2024-08-17T00:00:00Z',
    available_spots: 15,
    image_url: 'https://images.pexels.com/photos/1835718/pexels-photo-1835718.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'nacional',
    itinerary: [
      {
        day: 1,
        title: 'Viaje al Cabo',
        description: 'Traslado en camión 4x4 por las dunas hasta el pueblo.',
      },
      {
        day: 2,
        title: 'Exploración',
        description: 'Caminata al faro y avistamiento de lobos marinos.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Hospedaje',
        description: '2 noches en posada típica',
      },
      {
        icon: 'Compass',
        title: 'Excursiones',
        description: 'Traslados en 4x4 y caminatas guiadas',
      }
    ]
  },
  {
    id: '3',
    title: 'Valle del Lunarejo',
    destination: 'Rivera, Uruguay',
    description: 'Descubre uno de los paisajes más impresionantes de Uruguay en esta aventura de ecoturismo por el Valle del Lunarejo.',
    price: 18000,
    departure_date: '2024-09-20T00:00:00Z',
    return_date: '2024-09-22T00:00:00Z',
    available_spots: 12,
    image_url: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'nacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada al Valle',
        description: 'Check-in en la posada y caminata de reconocimiento.',
      },
      {
        day: 2,
        title: 'Trekking',
        description: 'Recorrido por senderos y cascadas del valle.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: '2 noches en posada rural',
      },
      {
        icon: 'Mountain',
        title: 'Actividades',
        description: 'Trekking guiado y observación de aves',
      }
    ]
  },
  {
    id: '4',
    title: 'Quebrada de los Cuervos',
    destination: 'Treinta y Tres, Uruguay',
    description: 'Explora la primera Área Natural Protegida de Uruguay en una experiencia única de contacto con la naturaleza.',
    price: 16500,
    departure_date: '2024-10-12T00:00:00Z',
    return_date: '2024-10-14T00:00:00Z',
    available_spots: 15,
    image_url: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'nacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a la Quebrada',
        description: 'Instalación en el camping y caminata introductoria.',
      },
      {
        day: 2,
        title: 'Exploración',
        description: 'Recorrido completo por los principales senderos.',
      }
    ],
    included_services: [
      {
        icon: 'Tent',
        title: 'Camping',
        description: '2 noches con equipo completo',
      },
      {
        icon: 'Compass',
        title: 'Guías',
        description: 'Guías especializados en naturaleza',
      }
    ]
  },
  {
    id: '5',
    title: 'Colonia del Sacramento',
    destination: 'Colonia, Uruguay',
    description: 'Descubre la magia del Barrio Histórico de Colonia, Patrimonio de la Humanidad, en un fin de semana inolvidable.',
    price: 14000,
    departure_date: '2024-06-21T00:00:00Z',
    return_date: '2024-06-23T00:00:00Z',
    available_spots: 20,
    image_url: 'https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'nacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Colonia',
        description: 'Check-in en el hotel y visita guiada por el Barrio Histórico.',
      },
      {
        day: 2,
        title: 'Exploración y Cultura',
        description: 'Visita a museos y tiempo libre para disfrutar de la gastronomía local.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: '2 noches en hotel céntrico',
      },
      {
        icon: 'Map',
        title: 'Visitas guiadas',
        description: 'Tour por los principales puntos históricos',
      }
    ]
  },
  {
    id: '6',
    title: 'Tacuarembó Rural',
    destination: 'Tacuarembó, Uruguay',
    description: 'Vive la auténtica experiencia de la vida rural uruguaya en una estancia tradicional de Tacuarembó.',
    price: 22000,
    departure_date: '2024-07-26T00:00:00Z',
    return_date: '2024-07-28T00:00:00Z',
    available_spots: 15,
    image_url: 'https://images.pexels.com/photos/5816294/pexels-photo-5816294.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'nacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a la Estancia',
        description: 'Recibimiento tradicional y actividades rurales.',
      },
      {
        day: 2,
        title: 'Vida de Campo',
        description: 'Cabalgatas, ordeñe y participación en tareas rurales.',
      }
    ],
    included_services: [
      {
        icon: 'Home',
        title: 'Estancia',
        description: '2 noches en estancia tradicional',
      },
      {
        icon: 'Utensils',
        title: 'Gastronomía',
        description: 'Pensión completa con comida criolla',
      }
    ]
  },
  // NUEVOS VIAJES NACIONALES
  {
    id: '19',
    title: 'Punta del Este Exclusivo',
    destination: 'Maldonado, Uruguay',
    description: 'Disfruta de un fin de semana de lujo en el balneario más prestigioso de Sudamérica. Recorre sus playas, casinos y restaurantes de primer nivel.',
    price: 28500,
    departure_date: '2024-11-15T00:00:00Z',
    return_date: '2024-11-17T00:00:00Z',
    available_spots: 10,
    image_url: 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'nacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Punta del Este',
        description: 'Check-in en hotel boutique y paseo por La Brava.',
      },
      {
        day: 2,
        title: 'Recorrido completo',
        description: 'Visita a Casapueblo, La Mano, puerto y Gorlero.',
      },
      {
        day: 3,
        title: 'Regreso con parada en José Ignacio',
        description: 'Brunch en José Ignacio y regreso a Montevideo.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: '2 noches en hotel boutique 4 estrellas',
      },
      {
        icon: 'Utensils',
        title: 'Gastronomía',
        description: 'Desayunos gourmet y cena de bienvenida',
      },
      {
        icon: 'Car',
        title: 'Transporte',
        description: 'Traslados en vehículo premium',
      }
    ]
  },
  {
    id: '20',
    title: 'Salto y Daymán Termal',
    destination: 'Salto, Uruguay',
    description: 'Sumérgete en las aguas termales de Daymán y disfruta de la ciudad de Salto en un viaje de relax y bienestar para toda la familia.',
    price: 19800,
    departure_date: '2024-08-23T00:00:00Z',
    return_date: '2024-08-26T00:00:00Z',
    available_spots: 18,
    image_url: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'nacional',
    itinerary: [
      {
        day: 1,
        title: 'Viaje a Salto',
        description: 'Salida desde Montevideo, llegada y check-in en hotel termal.',
      },
      {
        day: 2,
        title: 'Termas de Daymán',
        description: 'Día completo en el parque acuático termal de Daymán.',
      },
      {
        day: 3,
        title: 'City Tour Salto',
        description: 'Visita al centro de Salto, Represa de Salto Grande y tiempo libre.',
      },
      {
        day: 4,
        title: 'Regreso',
        description: 'Mañana libre en las termas y regreso a Montevideo.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: '3 noches en hotel con acceso a termas',
      },
      {
        icon: 'Bus',
        title: 'Transporte',
        description: 'Bus semicama con servicios a bordo',
      },
      {
        icon: 'Ticket',
        title: 'Entradas',
        description: 'Acceso ilimitado a parque acuático',
      }
    ]
  },

  // Internacional - 6 viajes
  {
    id: '7',
    title: 'Aventura en Bariloche',
    destination: 'Bariloche, Argentina',
    description: 'Disfruta de 7 días inolvidables en la hermosa ciudad de Bariloche. Incluye excursiones a Cerro Catedral, Circuito Chico y navegación por el Lago Nahuel Huapi.',
    price: 45000,
    departure_date: '2024-07-15T00:00:00Z',
    return_date: '2024-07-22T00:00:00Z',
    available_spots: 20,
    image_url: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    category: 'internacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Bariloche',
        description: 'Recepción en el aeropuerto y traslado al hotel.',
      },
      {
        day: 2,
        title: 'Circuito Chico',
        description: 'Excursión por los principales puntos turísticos.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: '7 noches en hotel 4 estrellas',
      },
      {
        icon: 'Map',
        title: 'Excursiones',
        description: 'Todas las excursiones incluidas',
      }
    ]
  },
  {
    id: '8',
    title: 'París Romántico',
    destination: 'París, Francia',
    description: 'Descubre la Ciudad de la Luz en un viaje romántico de 8 días. Visitas a la Torre Eiffel, Louvre, Versalles y más.',
    price: 120000,
    departure_date: '2024-09-10T00:00:00Z',
    return_date: '2024-09-18T00:00:00Z',
    available_spots: 15,
    image_url: 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'internacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a París',
        description: 'Traslado al hotel y paseo nocturno por el Sena.',
      },
      {
        day: 2,
        title: 'Torre Eiffel',
        description: 'Visita a la Torre Eiffel y Campos Elíseos.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: '7 noches en hotel boutique',
      },
      {
        icon: 'Ticket',
        title: 'Entradas',
        description: 'Acceso a principales atracciones',
      }
    ]
  },
  {
    id: '9',
    title: 'Maravillas de Egipto',
    destination: 'El Cairo, Egipto',
    description: 'Explora las antiguas maravillas de Egipto en un viaje de 10 días. Pirámides, crucero por el Nilo y más.',
    price: 150000,
    departure_date: '2024-10-05T00:00:00Z',
    return_date: '2024-10-15T00:00:00Z',
    available_spots: 12,
    image_url: 'https://images.pexels.com/photos/71241/pexels-photo-71241.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'internacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a El Cairo',
        description: 'Recepción y traslado al hotel.',
      },
      {
        day: 2,
        title: 'Pirámides',
        description: 'Visita a las Pirámides de Giza y la Esfinge.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Hoteles 5 estrellas y crucero',
      },
      {
        icon: 'Plane',
        title: 'Vuelos internos',
        description: 'Todos los vuelos dentro de Egipto',
      }
    ]
  },
  {
    id: '10',
    title: 'Japón Tradicional',
    destination: 'Tokio, Japón',
    description: 'Descubre la perfecta mezcla entre tradición y modernidad en un viaje de 12 días por Japón.',
    price: 180000,
    departure_date: '2024-11-01T00:00:00Z',
    return_date: '2024-11-13T00:00:00Z',
    available_spots: 15,
    image_url: 'https://images.pexels.com/photos/590478/pexels-photo-590478.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'internacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Tokio',
        description: 'Traslado y primera exploración de la ciudad.',
      },
      {
        day: 2,
        title: 'Tokio Moderno',
        description: 'Visita a Shibuya, Harajuku y Shinjuku.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Hoteles y ryokan tradicional',
      },
      {
        icon: 'Train',
        title: 'JR Pass',
        description: 'Pase de tren incluido',
      }
    ]
  },
  {
    id: '11',
    title: 'Costa Rica Natural',
    destination: 'San José, Costa Rica',
    description: 'Aventura de 8 días por los parques nacionales y playas más hermosas de Costa Rica.',
    price: 85000,
    departure_date: '2024-08-20T00:00:00Z',
    return_date: '2024-08-28T00:00:00Z',
    available_spots: 16,
    image_url: 'https://images.pexels.com/photos/2537638/pexels-photo-2537638.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'internacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a San José',
        description: 'Recepción y traslado al hotel.',
      },
      {
        day: 2,
        title: 'Volcán Arenal',
        description: 'Visita al parque nacional y aguas termales.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Lodges y hoteles boutique',
      },
      {
        icon: 'Car',
        title: 'Traslados',
        description: 'Todos los traslados incluidos',
      }
    ]
  },
  {
    id: '12',
    title: 'Machu Picchu Mágico',
    destination: 'Cusco, Perú',
    description: 'Viaje de 7 días descubriendo los secretos del Imperio Inca y Machu Picchu.',
    price: 75000,
    departure_date: '2024-09-05T00:00:00Z',
    return_date: '2024-09-12T00:00:00Z',
    available_spots: 18,
    image_url: 'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'internacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Cusco',
        description: 'Aclimatación y city tour.',
      },
      {
        day: 2,
        title: 'Valle Sagrado',
        description: 'Visita a Pisac y Ollantaytambo.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Hoteles con encanto',
      },
      {
        icon: 'Train',
        title: 'Tren',
        description: 'Tren a Machu Picchu incluido',
      }
    ]
  },
  // NUEVOS VIAJES INTERNACIONALES
  {
    id: '21',
    title: 'Islas Griegas Paradisíacas',
    destination: 'Atenas, Grecia',
    description: 'Recorre las islas más hermosas del Mar Egeo en un crucero de ensueño. Santorini, Mykonos, Creta y más te esperan en este viaje inolvidable por el Mediterráneo.',
    price: 195000,
    departure_date: '2024-06-10T00:00:00Z',
    return_date: '2024-06-20T00:00:00Z',
    available_spots: 14,
    image_url: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'internacional',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Atenas',
        description: 'Recepción en el aeropuerto y traslado al hotel en el centro histórico.',
      },
      {
        day: 2,
        title: 'Acrópolis y Plaka',
        description: 'Visita guiada a la Acrópolis, Partenón y paseo por el barrio de Plaka.',
      },
      {
        day: 3,
        title: 'Embarque en crucero',
        description: 'Traslado al puerto del Pireo y embarque en crucero por las islas griegas.',
      },
      {
        day: 4,
        title: 'Mykonos',
        description: 'Día completo en la cosmopolita isla de Mykonos.',
      },
      {
        day: 5,
        title: 'Santorini',
        description: 'Visita a la espectacular isla de Santorini con sus casas blancas y azules.',
      },
      {
        day: 6,
        title: 'Creta',
        description: 'Exploración de Heraklion y el Palacio de Knossos en Creta.',
      },
      {
        day: 7,
        title: 'Rodas',
        description: 'Visita a la medieval ciudad de Rodas y sus playas.',
      },
      {
        day: 8,
        title: 'Día de navegación',
        description: 'Disfrute de las instalaciones del crucero en día de navegación.',
      },
      {
        day: 9,
        title: 'Regreso a Atenas',
        description: 'Desembarque y última noche en Atenas.',
      },
      {
        day: 10,
        title: 'Regreso a Uruguay',
        description: 'Traslado al aeropuerto y vuelo de regreso.',
      }
    ],
    included_services: [
      {
        icon: 'Plane',
        title: 'Vuelos',
        description: 'Vuelos internacionales con tasas incluidas',
      },
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: '2 noches en Atenas y 7 noches en crucero',
      },
      {
        icon: 'Ship',
        title: 'Crucero',
        description: 'Crucero en pensión completa por las islas',
      },
      {
        icon: 'Utensils',
        title: 'Comidas',
        description: 'Todas las comidas en el crucero incluidas',
      },
      {
        icon: 'Map',
        title: 'Excursiones',
        description: 'Excursiones en cada isla con guía en español',
      }
    ]
  },
  {
    id: '22',
    title: 'Sudáfrica Safari y Ciudad',
    destination: 'Ciudad del Cabo, Sudáfrica',
    description: 'Combina la emoción de un safari en la sabana africana con la belleza de Ciudad del Cabo en este viaje único que te acercará a los "Big Five" y a paisajes impresionantes.',
    price: 210000,
    departure_date: '2024-09-25T00:00:00Z',
    return_date: '2024-10-05T00:00:00Z',
    available_spots: 12,
    image_url: 'https://images.pexels.com/photos/33045/lion-wild-africa-african.jpg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'internacional',
    itinerary: [
      {
        day: 1,
        title: 'Vuelo a Johannesburgo',
        description: 'Salida desde Montevideo con destino a Johannesburgo.',
      },
      {
        day: 2,
        title: 'Llegada a Johannesburgo',
        description: 'Recepción en el aeropuerto y traslado al hotel.',
      },
      {
        day: 3,
        title: 'Parque Kruger',
        description: 'Traslado al Parque Nacional Kruger, check-in en lodge.',
      },
      {
        day: 4,
        title: 'Safari matutino',
        description: 'Safari al amanecer para avistar los "Big Five".',
      },
      {
        day: 5,
        title: 'Safari vespertino',
        description: 'Safari al atardecer y cena bajo las estrellas.',
      },
      {
        day: 6,
        title: 'Vuelo a Ciudad del Cabo',
        description: 'Traslado al aeropuerto y vuelo a Ciudad del Cabo.',
      },
      {
        day: 7,
        title: 'Table Mountain',
        description: 'Visita a Table Mountain y recorrido por la ciudad.',
      },
      {
        day: 8,
        title: 'Cabo de Buena Esperanza',
        description: 'Excursión al Cabo de Buena Esperanza y colonia de pingüinos.',
      },
      {
        day: 9,
        title: 'Ruta de los Vinos',
        description: 'Tour por la famosa región vinícola de Stellenbosch.',
      },
      {
        day: 10,
        title: 'Regreso a Uruguay',
        description: 'Traslado al aeropuerto y vuelo de regreso.',
      }
    ],
    included_services: [
      {
        icon: 'Plane',
        title: 'Vuelos',
        description: 'Vuelos internacionales y domésticos',
      },
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Hoteles 4* y lodge de safari',
      },
      {
        icon: 'Jeep',
        title: 'Safaris',
        description: '4 safaris en vehículos 4x4 abiertos',
      },
      {
        icon: 'Utensils',
        title: 'Comidas',
        description: 'Desayunos diarios y pensión completa en safari',
      },
      {
        icon: 'Users',
        title: 'Guías',
        description: 'Guías especializados en español',
      }
    ]
  },

  // Salidas Grupales - 6 viajes
  {
    id: '13',
    title: 'Europa Grupal 2024',
    destination: 'Europa',
    description: 'Recorrido grupal de 21 días por las principales ciudades de Europa. Ideal para viajeros sociales.',
    price: 250000,
    departure_date: '2024-09-01T00:00:00Z',
    return_date: '2024-09-22T00:00:00Z',
    available_spots: 25,
    image_url: 'https://images.pexels.com/photos/705764/pexels-photo-705764.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'grupal',
    itinerary: [
      {
        day: 1,
        title: 'Inicio en Madrid',
        description: 'Encuentro del grupo y cena de bienvenida.',
      },
      {
        day: 2,
        title: 'Madrid Histórico',
        description: 'Visita al Palacio Real y Plaza Mayor.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Hoteles 4 estrellas',
      },
      {
        icon: 'Users',
        title: 'Guía',
        description: 'Guía acompañante todo el viaje',
      }
    ]
  },
  {
    id: '14',
    title: 'Turquía Grupal',
    destination: 'Estambul, Turquía',
    description: 'Viaje grupal de 15 días por Turquía, incluyendo Capadocia y la costa turca.',
    price: 180000,
    departure_date: '2024-10-10T00:00:00Z',
    return_date: '2024-10-25T00:00:00Z',
    available_spots: 20,
    image_url: 'https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'grupal',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Estambul',
        description: 'Recepción del grupo y cena típica.',
      },
      {
        day: 2,
        title: 'Estambul Histórico',
        description: 'Santa Sofía y Mezquita Azul.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Hoteles seleccionados',
      },
      {
        icon: 'Utensils',
        title: 'Comidas',
        description: 'Media pensión incluida',
      }
    ]
  },
  {
    id: '15',
    title: 'India Grupal',
    destination: 'Delhi, India',
    description: 'Viaje grupal de 14 días por el Triángulo Dorado y Varanasi.',
    price: 160000,
    departure_date: '2024-11-05T00:00:00Z',
    return_date: '2024-11-19T00:00:00Z',
    available_spots: 18,
    image_url: 'https://images.pexels.com/photos/5458388/pexels-photo-5458388.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'grupal',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Delhi',
        description: 'Bienvenida tradicional y cena.',
      },
      {
        day: 2,
        title: 'Old Delhi',
        description: 'Visita a Jama Masjid y Chandni Chowk.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Hoteles heritage y modernos',
      },
      {
        icon: 'Car',
        title: 'Transporte',
        description: 'Todos los traslados incluidos',
      }
    ]
  },
  {
    id: '16',
    title: 'Grecia Grupal',
    destination: 'Atenas, Grecia',
    description: 'Recorrido grupal de 12 días por Grecia continental e islas.',
    price: 145000,
    departure_date: '2024-06-15T00:00:00Z',
    return_date: '2024-06-27T00:00:00Z',
    available_spots: 22,
    image_url: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'grupal',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Atenas',
        description: 'Encuentro del grupo y cena de bienvenida.',
      },
      {
        day: 2,
        title: 'Acrópolis',
        description: 'Visita guiada a la Acrópolis y Plaka.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Hoteles y ferry entre islas',
      },
      {
        icon: 'Ship',
        title: 'Crucero',
        description: 'Crucero por las islas incluido',
      }
    ]
  },
  {
    id: '17',
    title: 'Vietnam y Camboya Grupal',
    destination: 'Hanoi, Vietnam',
    description: 'Aventura grupal de 16 días por Vietnam y los templos de Angkor.',
    price: 190000,
    departure_date: '2024-07-10T00:00:00Z',
    return_date: '2024-07-26T00:00:00Z',
    available_spots: 16,
    image_url: 'https://images.pexels.com/photos/5117913/pexels-photo-5117913.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'grupal',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Hanoi',
        description: 'Recepción y cena de bienvenida.',
      },
      {
        day: 2,
        title: 'Hanoi Cultural',
        description: 'Templo de la Literatura y lago Hoan Kiem.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Hoteles seleccionados',
      },
      {
        icon: 'Plane',
        title: 'Vuelos',
        description: 'Vuelos internos incluidos',
      }
    ]
  },
  {
    id: '18',
    title: 'Marruecos Grupal',
    destination: 'Marrakech, Marruecos',
    description: 'Viaje grupal de 10 días por las ciudades imperiales y el desierto.',
    price: 130000,
    departure_date: '2024-09-20T00:00:00Z',
    return_date: '2024-09-30T00:00:00Z',
    available_spots: 20,
    image_url: 'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    category: 'grupal',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Marrakech',
        description: 'Recepción y cena en la Medina.',
      },
      {
        day: 2,
        title: 'Marrakech',
        description: 'Visita a la Medina y Jardines Majorelle.',
      }
    ],
    included_services: [
      {
        icon: 'Hotel',
        title: 'Alojamiento',
        description: 'Riads y campamento en el desierto',
      },
      {
        icon: 'Compass',
        title: 'Excursiones',
        description: 'Todas las excursiones incluidas',
      }
    ]
  }
];

// Mock Bookings
export const bookings: Booking[] = [
  {
    id: '1',
    trip_id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '099123456',
    created_at: '2024-03-10T00:00:00Z',
    trip: trips[0],
  },
  {
    id: '2',
    trip_id: '2',
    name: 'María Rodríguez',
    email: 'maria@example.com',
    phone: '098765432',
    created_at: '2024-03-11T00:00:00Z',
    trip: trips[1],
  },
];

// Mock Stats
export const stats: Stats = {
  totalTrips: trips.length,
  totalBookings: bookings.length,
  upcomingTrips: trips.filter(trip => new Date(trip.departure_date) > new Date()).length,
  popularDestinations: [
    { destination: 'Bariloche, Argentina', count: 1 },
    { destination: 'París, Francia', count: 1 },
    { destination: 'Paysandú, Uruguay', count: 1 },
  ],
};

// Blog Posts Mock Data
export const blogPosts: BlogPost[] = [
  // ... [Previous blog posts remain exactly the same]
];