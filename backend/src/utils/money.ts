/**
 * Amounts are stored and transmitted as integer minor units (cents).
 *
 * Doubles cannot represent most decimal fractions exactly, so summing them
 * accumulates error: a ledger of 0.10 and 0.20 sums to 0.30000000000000004.
 * Integers make every total exact, and formatting happens only at render.
 */

export const MINOR_UNITS_PER_MAJOR = 100;

/** Largest amount that survives integer arithmetic — about 90 trillion. */
export const MAX_MINOR_UNITS = Number.MAX_SAFE_INTEGER;

/**
 * Converts a decimal amount to minor units, rounding half away from zero so
 * 0.005 becomes 1 cent rather than 0.
 */
export const toMinorUnits = (major: number): number => {
  const scaled = major * MINOR_UNITS_PER_MAJOR;
  // Correct the representation error introduced by the multiply before
  // rounding: 1.005 * 100 is 100.49999999999999, which would round down.
  return Math.round(Number(scaled.toFixed(4)));
};

/** Converts minor units back to a decimal amount, for display and export. */
export const toMajorUnits = (minor: number): number =>
  minor / MINOR_UNITS_PER_MAJOR;
