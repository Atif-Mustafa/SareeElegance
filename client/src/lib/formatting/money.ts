/**
 * Money formatting utilities.
 * Note: Currently this assumes the backend returns minor units for currencies
 * that have 2 decimal places (like INR, USD, EUR).
 * Authoritative pricing calculation remains on the backend.
 * This is strictly for rendering/display purposes.
 */

export interface Money {
  amountMinor: string;
  currency: string;
}

export function formatMoney(money: Money | { amountMinor: string | number; currency?: string }): string {
  const currency = money.currency || 'INR';
  const amountStr = String(money.amountMinor);
  
  // BigInt/string-safe conversion to major units
  // Assuming 2 decimal places. Pad with leading zeros if length < 3
  const paddedAmount = amountStr.padStart(3, '0');
  const majorStr = paddedAmount.slice(0, -2);
  const fractionStr = paddedAmount.slice(-2);
  
  const major = BigInt(majorStr);
  const isFractionZero = fractionStr === '00';
  
  // Use Intl.NumberFormat with the extracted parts, or simple string formatting
  const formattedMajor = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(major)); // We use Number here only for formatting the whole part, which is safe for normal checkout sums
  
  if (isFractionZero) {
    return formattedMajor;
  }
  
  // If there's a fraction and we need it (though formatMoney historically rounded to 0 decimals for INR)
  // we could append it, but we'll stick to original behavior of no fractions for INR typically
  return formattedMajor;
}
