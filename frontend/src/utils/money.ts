/**
 * The API stores and transmits amounts as integer minor units (cents) so
 * totals stay exact. Nothing here should feed back into arithmetic — convert
 * only at the point of display or of filling a form field.
 */

const MINOR_UNITS_PER_MAJOR = 100;

export const DEFAULT_CURRENCY = "USD";

/** For a form input, which edits a decimal amount. */
export const toMajorUnits = (minor: number): number =>
  minor / MINOR_UNITS_PER_MAJOR;

// Intl formatters are costly to build, and the currency rarely changes.
const cache = new Map<string, Intl.NumberFormat>();

const formatterFor = (currency: string, whole: boolean): Intl.NumberFormat => {
  const key = `${currency}:${whole}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const created = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  });
  cache.set(key, created);
  return created;
};

/** "$1,234.56" — always two decimals, in the given currency. */
export const formatAmount = (
  minor: number,
  currency: string = DEFAULT_CURRENCY
): string => formatterFor(currency, false).format(toMajorUnits(minor));

/**
 * "$1,234" when the amount is whole, "$1,234.56" otherwise. Used for headline
 * figures where trailing zeroes are noise.
 */
export const formatAmountCompact = (
  minor: number,
  currency: string = DEFAULT_CURRENCY
): string =>
  formatterFor(currency, minor % MINOR_UNITS_PER_MAJOR === 0).format(
    toMajorUnits(minor)
  );
