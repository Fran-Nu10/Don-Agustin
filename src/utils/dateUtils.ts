/**
 * Date utility functions for handling dates without timezone shifts
 * Specifically designed to handle YYYY-MM-DD dates as local dates
 */

/**
 * Creates a valid Date object from a date string, handling local dates properly
 * @param dateString - The date string to parse (can be YYYY-MM-DD or full ISO string)
 * @returns Date object or null if invalid
 */
export function createValidDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  try {
    // Check if it's a simple YYYY-MM-DD format (without time)
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    
    if (dateOnlyPattern.test(dateString)) {
      // For YYYY-MM-DD format, create a local date to avoid timezone shifts
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day); // month is 0-indexed
      
      // Verify the date is valid
      if (isNaN(localDate.getTime())) {
        console.warn('Invalid date created from:', dateString);
        return null;
      }
      
      return localDate;
    } else {
      // For full ISO strings or other formats, use standard Date constructor
      const date = new Date(dateString);
      
      // Verify the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date created from:', dateString);
        return null;
      }
      
      return date;
    }
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
}

/**
 * Formats a date for display in Spanish locale
 * @param date - Date object to format
 * @param formatString - Format string (default: 'dd MMM yyyy')
 * @returns Formatted date string
 */
export function formatDateES(date: Date | null, formatString: string = 'dd MMM yyyy'): string {
  if (!date) return 'Fecha no disponible';
  
  try {
    // Import format and es locale dynamically to avoid circular dependencies
    const { format } = require('date-fns');
    const { es } = require('date-fns/locale');
    
    return format(date, formatString, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toLocaleDateString('es-UY');
  }
}

/**
 * Calculates the duration between two dates in days
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration in days
 */
export function calculateDuration(startDate: Date | null, endDate: Date | null): number {
  if (!startDate || !endDate) return 0;
  
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Checks if a date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isDateInPast(date: Date | null): boolean {
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0); // Reset time to start of day
  
  return compareDate < today;
}

/**
 * Checks if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date | null): boolean {
  if (!date) return false;
  
  const today = new Date();
  const compareDate = new Date(date);
  
  return today.getFullYear() === compareDate.getFullYear() &&
         today.getMonth() === compareDate.getMonth() &&
         today.getDate() === compareDate.getDate();
}