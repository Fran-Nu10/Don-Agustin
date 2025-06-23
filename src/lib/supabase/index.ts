// Re-export everything from client for backward compatibility
export * from './client';
export { supabase as default } from './client';

// Convert price from UYU to USD
export function convertToUSD(price: number): number {
  // Using an approximate conversion rate of 40 UYU = 1 USD
  return Math.round(price / 40);
}

// Convert price from USD to UYU
export function convertToUYU(price: number): number {
  // Using an approximate conversion rate of 40 UYU = 1 USD
  return Math.round(price * 40);
}