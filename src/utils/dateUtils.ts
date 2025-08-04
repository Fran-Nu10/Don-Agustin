/**
 * Date utility functions to handle date display correctly
 * Prevents day shifting when displaying dates from the database
 */

/**
 * Creates a valid Date object from a date string, interpreting YYYY-MM-DD as local date
 * This prevents the common issue where dates shift by one day due to timezone conversion
 * @param dateString - Date string from database (can be YYYY-MM-DD or full ISO string)
 * @returns Date object or null if invalid
 */
export function createValidDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  try {
    // Extract only the YYYY-MM-DD part from the date string
    // This is crucial because database dates might come with time and timezone info
    // By taking only YYYY-MM-DD, we ensure it's interpreted as a local calendar date
    const datePart = dateString.split('T')[0];
    
    // Parse as local date by creating Date with year, month, day components
    // This avoids timezone conversion issues that cause day shifting
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Create date in local timezone (month is 0-indexed in JavaScript)
    const localDate = new Date(year, month - 1, day);
    
    // Verify the date is valid
    if (isNaN(localDate.getTime())) {
      console.warn('Invalid date created from:', dateString);
      return null;
    }
    
    return localDate;
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
}

/**
 * Helper function to safely format a date string for display
 * @param dateString - Date string from database
 * @param formatFn - Function to format the date (e.g., from date-fns)
 * @returns Formatted date string or fallback text
 */
export function formatDisplayDate(
  dateString: string | null | undefined, 
  formatFn: (date: Date) => string,
  fallback: string = 'Fecha no disponible'
): string {
  const date = createValidDate(dateString);
  return date ? formatFn(date) : fallback;
}