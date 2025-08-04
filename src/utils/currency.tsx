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
      style: 'currency',
      currency: 'USD',
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

/**
 * Converts UYU to USD using approximate exchange rate
 * @param amountUYU - Amount in Uruguayan Pesos
 * @returns Amount in USD
 */
export function convertToUSD(amountUYU: number): number {
  // Using approximate conversion rate of 40 UYU = 1 USD
  return Math.round(amountUYU / 40);
}

/**
 * Gets trip value in USD for display purposes
 * @param tripValue - Trip value (can be in UYU or USD)
 * @param currency - Currency type
 * @returns Value in USD
 */
export function getTripValueUSD(tripValue?: number, currency: 'UYU' | 'USD' = 'UYU'): number {
  if (!tripValue) return 0;
  
  if (currency === 'USD') {
    return tripValue;
  } else {
    return convertToUSD(tripValue);
  }
}