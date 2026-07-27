/**
 * Transaction dates arrive as "YYYY-MM-DD" and are stored at UTC midnight,
 * so every boundary derived from them must be computed in UTC too. Using the
 * local-time constructors here makes budget membership depend on the server's
 * timezone: west of UTC the first of the month falls outside its own month.
 */

export interface DateRange {
  /** Inclusive lower bound. */
  from: Date;
  /** Exclusive upper bound. */
  to: Date;
}

/** Half-open UTC range covering a "YYYY-MM" month. */
export const monthRange = (month: string): DateRange => {
  const [year, mon] = month.split("-").map(Number) as [number, number];

  return {
    from: new Date(Date.UTC(year, mon - 1, 1)),
    to: new Date(Date.UTC(year, mon, 1)),
  };
};

/** Last representable instant of a "YYYY-MM-DD" day, in UTC. */
export const endOfUtcDay = (date: Date): Date => {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return end;
};
