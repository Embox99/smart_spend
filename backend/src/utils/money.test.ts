import { describe, expect, it } from "vitest";
import { toMajorUnits, toMinorUnits } from "./money";

describe("toMinorUnits", () => {
  it("scales whole and two-decimal amounts exactly", () => {
    expect(toMinorUnits(10)).toBe(1000);
    expect(toMinorUnits(12.5)).toBe(1250);
    expect(toMinorUnits(0.01)).toBe(1);
    expect(toMinorUnits(1234.56)).toBe(123456);
  });

  it("survives values whose scaled double falls just short", () => {
    // 12.29 * 100 is 1228.9999999999998; a bare Math.round would give 1229
    // here but the naive floor used elsewhere would give 1228.
    expect(toMinorUnits(12.29)).toBe(1229);
    expect(toMinorUnits(1.005)).toBe(101);
    expect(toMinorUnits(8.115)).toBe(812);
  });

  it("rounds beyond two decimals to the nearest cent", () => {
    expect(toMinorUnits(1.004)).toBe(100);
    expect(toMinorUnits(1.006)).toBe(101);
    expect(toMinorUnits(0.004)).toBe(0);
  });

  it("round-trips back to the original amount", () => {
    for (const amount of [10, 12.5, 0.01, 1234.56, 999999.99]) {
      expect(toMajorUnits(toMinorUnits(amount))).toBe(amount);
    }
  });
});

describe("integer arithmetic", () => {
  it("sums exactly where decimals would drift", () => {
    const decimalSum = 0.1 + 0.2;
    expect(decimalSum).not.toBe(0.3);

    const minorSum = toMinorUnits(0.1) + toMinorUnits(0.2);
    expect(minorSum).toBe(30);
    expect(toMajorUnits(minorSum)).toBe(0.3);
  });

  it("keeps a long ledger exact", () => {
    const amounts = Array.from({ length: 100 }, () => 0.07);

    const decimalTotal = amounts.reduce((a, b) => a + b, 0);
    expect(decimalTotal).not.toBe(7);

    const minorTotal = amounts
      .map(toMinorUnits)
      .reduce((a: number, b: number) => a + b, 0);
    expect(toMajorUnits(minorTotal)).toBe(7);
  });
});
