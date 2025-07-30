/**
 * Currency formatting utilities for the travel application
 */

export type CurrencyType = 'UYU' | 'USD';

/**
 * Format a price with the appropriate currency symbol and formatting
 * @param amount The price amount
 * @param currency The currency type ('UYU' or 'USD')
 * @returns Formatted price string
 */
export function formatPrice(amount: number | null | undefined, currency: CurrencyType = 'UYU'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return currency === 'USD' ? '$0' : '$U 0';
  }

  const numericAmount = Number(amount);

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } else {
    // UYU formatting
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  }
}

/**
 * Get currency symbol for display
 * @param currency The currency type
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: CurrencyType = 'UYU'): string {
  return currency === 'USD' ? '$' : '$U';
}

/**
 * Get currency label for display
 * @param currency The currency type
 * @returns Currency label
 */
export function getCurrencyLabel(currency: CurrencyType = 'UYU'): string {
  return currency === 'USD' ? 'Dólares (USD)' : 'Pesos Uruguayos (UYU)';
}

/**
 * Convert between currencies using approximate exchange rate
 * @param amount Amount to convert
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyType,
  toCurrency: CurrencyType
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Using approximate exchange rate of 40 UYU = 1 USD
  const EXCHANGE_RATE = 40;

  if (fromCurrency === 'UYU' && toCurrency === 'USD') {
    return amount / EXCHANGE_RATE;
  } else if (fromCurrency === 'USD' && toCurrency === 'UYU') {
    return amount * EXCHANGE_RATE;
  }

  return amount;
}

/**
 * Format price for reports (always in USD for consistency)
 * @param amount The price amount
 * @param currency The original currency
 * @returns Formatted USD price for reports
 */
export function formatPriceForReports(amount: number | null | undefined, currency: CurrencyType = 'UYU'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }

  const usdAmount = currency === 'UYU' ? convertCurrency(amount, 'UYU', 'USD') : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(usdAmount);
}