import { describe, expect, it } from "vitest";
import { formatAmount, formatAmountCompact, toMajorUnits } from "./money";

/** Non-breaking spaces vary by locale/ICU build; compare on the digits. */
const digits = (formatted: string) => formatted.replace(/[^\d.,]/g, "");

describe("toMajorUnits", () => {
  it("converts cents back to a decimal amount", () => {
    expect(toMajorUnits(1250)).toBe(12.5);
    expect(toMajorUnits(1)).toBe(0.01);
    expect(toMajorUnits(0)).toBe(0);
  });
});

describe("formatAmount", () => {
  it("always shows two decimals", () => {
    expect(digits(formatAmount(1000))).toBe("10.00");
    expect(digits(formatAmount(1250))).toBe("12.50");
    expect(digits(formatAmount(1))).toBe("0.01");
  });

  it("groups thousands", () => {
    expect(digits(formatAmount(123456789))).toBe("1,234,567.89");
  });

  it("carries the currency symbol", () => {
    expect(formatAmount(1000, "USD")).toContain("$");
    expect(formatAmount(1000, "EUR")).toContain("€");
    expect(formatAmount(1000, "ILS")).toContain("₪");
  });

  it("defaults to USD when no currency is given", () => {
    expect(formatAmount(1000)).toBe(formatAmount(1000, "USD"));
  });
});

describe("formatAmountCompact", () => {
  it("drops the decimals on whole amounts", () => {
    expect(digits(formatAmountCompact(100000))).toBe("1,000");
    expect(digits(formatAmountCompact(0))).toBe("0");
  });

  it("keeps them when there are cents", () => {
    expect(digits(formatAmountCompact(123456))).toBe("1,234.56");
    expect(digits(formatAmountCompact(1))).toBe("0.01");
  });
});

describe("exactness", () => {
  it("adds cents without drift before formatting", () => {
    // The same figures as decimals: 0.1 + 0.2 !== 0.3
    const total = [10, 20].reduce((a, b) => a + b, 0);

    expect(digits(formatAmount(total))).toBe("0.30");
  });

  it("keeps a long ledger exact", () => {
    const total = Array.from({ length: 100 }, () => 7).reduce(
      (a, b) => a + b,
      0
    );

    expect(digits(formatAmount(total))).toBe("7.00");
  });
});
