/**
 * The API stores and transmits amounts as integer minor units (cents) so
 * totals stay exact. Nothing here should feed back into arithmetic — convert
 * only at the point of display or of filling a form field.
 */

const MINOR_UNITS_PER_MAJOR = 100;

/** For a form input, which edits a decimal amount. */
export const toMajorUnits = (minor: number): number =>
  minor / MINOR_UNITS_PER_MAJOR;

/** For an outgoing request body, which carries a decimal amount. */
export const parseAmountInput = (input: string): number => Number(input);

const formatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

/** "1,234.56" — always two decimals. */
export const formatAmount = (minor: number): string =>
  formatter.format(toMajorUnits(minor));

/**
 * "1,234" when the amount is whole, "1,234.56" otherwise. Used for headline
 * figures where trailing zeroes are noise.
 */
export const formatAmountCompact = (minor: number): string =>
  minor % MINOR_UNITS_PER_MAJOR === 0
    ? wholeFormatter.format(toMajorUnits(minor))
    : formatAmount(minor);
