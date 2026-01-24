/**
 * Currency utility functions for Don Agustín Viajes
 */

/**
 * Formats a price with explicit currency indication
 * @param price - The price amount
 * @param currency - The currency type ('UYU' or 'USD')
 * @returns Formatted price string with clear currency indication
 */
export function formatPrice(price: number, currency: 'UYU' | 'USD' = 'UYU'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' USD';
  } else {
    // For UYU, use $ prefix without additional currency code
    return '$ ' + new Intl.NumberFormat('es-UY', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }
}