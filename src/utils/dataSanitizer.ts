/**
 * Data sanitization utility for cleaning form data before sending to Supabase
 * Removes invisible characters, emojis, and special symbols that could break database operations
 */

/**
 * Sanitizes a string by removing invisible characters, emojis, and special symbols
 * @param text - The string to sanitize
 * @returns Cleaned string
 */
function sanitizeString(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove invisible characters (zero-width spaces, joiners, BOM)
    .replace(/[""''–—]/g, '-') // Replace typographic quotes and dashes with ASCII equivalents
    .replace(/[\u0000-\u001F]/g, '') // Remove ASCII control characters
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove basic emojis
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove misc symbols and pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport and map symbols
    .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Remove alchemical symbols
    .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Remove geometric shapes extended
    .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Remove supplemental arrows-C
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Remove supplemental symbols and pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Remove chess symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Remove symbols and pictographs extended-A
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove miscellaneous symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Remove dingbats
    .trim();
}

/**
 * Recursively sanitizes all string values in an object or array
 * @param data - The data to sanitize (can be object, array, or primitive)
 * @returns A new sanitized copy of the data
 */
export function sanitizeFormData<T>(data: T): T {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings
  if (typeof data === 'string') {
    return sanitizeString(data) as T;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFormData(item)) as T;
  }

  // Handle objects (including Date objects, which we want to preserve)
  if (typeof data === 'object') {
    // Preserve Date objects
    if (data instanceof Date) {
      return data;
    }

    // Handle regular objects
    const sanitizedObject: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Sanitize the key as well (in case object keys contain special characters)
      const sanitizedKey = typeof key === 'string' ? sanitizeString(key) : key;
      
      // Recursively sanitize the value
      sanitizedObject[sanitizedKey] = sanitizeFormData(value);
    }
    
    return sanitizedObject as T;
  }

  // Handle primitives (numbers, booleans, etc.)
  return data;
}

/**
 * Sanitizes trip form data specifically
 * @param tripData - Trip form data to sanitize
 * @returns Sanitized trip data
 */
export function sanitizeTripData(tripData: any): any {
  console.log('🧹 [SANITIZER] Iniciando sanitización de datos del viaje...');
  console.log('📋 [SANITIZER] Datos originales:', JSON.stringify(tripData, null, 2));
  
  const sanitized = sanitizeFormData(tripData);
  
  console.log('✅ [SANITIZER] Datos sanitizados:', JSON.stringify(sanitized, null, 2));
  console.log('🧹 [SANITIZER] Sanitización completada');
  
  return sanitized;
}

/**
 * Sanitizes client form data specifically
 * @param clientData - Client form data to sanitize
 * @returns Sanitized client data
 */
export function sanitizeClientData(clientData: any): any {
  console.log('🧹 [SANITIZER] Iniciando sanitización de datos del cliente...');
  console.log('📋 [SANITIZER] Datos originales:', JSON.stringify(clientData, null, 2));
  
  const sanitized = sanitizeFormData(clientData);
  
  console.log('✅ [SANITIZER] Datos sanitizados:', JSON.stringify(sanitized, null, 2));
  console.log('🧹 [SANITIZER] Sanitización completada');
  
  return sanitized;
}

/**
 * Sanitizes blog post data specifically
 * @param blogData - Blog post data to sanitize
 * @returns Sanitized blog data
 */
export function sanitizeBlogData(blogData: any): any {
  console.log('🧹 [SANITIZER] Iniciando sanitización de datos del blog...');
  console.log('📋 [SANITIZER] Datos originales:', JSON.stringify(blogData, null, 2));
  
  const sanitized = sanitizeFormData(blogData);
  
  console.log('✅ [SANITIZER] Datos sanitizados:', JSON.stringify(sanitized, null, 2));
  console.log('🧹 [SANITIZER] Sanitización completada');
  
  return sanitized;
}