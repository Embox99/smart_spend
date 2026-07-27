import { describe, expect, it } from "vitest";
import { endOfUtcDay, monthRange } from "./dateRange";

describe("monthRange", () => {
  // Pinned to exact instants: the previous implementation used the local-time
  // Date constructor, so these assertions failed on any server not in UTC.
  it("spans the month in UTC regardless of the server timezone", () => {
    const { from, to } = monthRange("2024-03");

    expect(from.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    expect(to.toISOString()).toBe("2024-04-01T00:00:00.000Z");
  });

  it("includes a transaction dated the first of the month", () => {
    const { from, to } = monthRange("2024-03");
    const firstOfMonth = new Date("2024-03-01");

    expect(firstOfMonth >= from && firstOfMonth < to).toBe(true);
  });

  it("excludes the last day of the previous month and the first of the next", () => {
    const { from, to } = monthRange("2024-03");

    expect(new Date("2024-02-29") >= from).toBe(false);
    expect(new Date("2024-04-01") < to).toBe(false);
  });

  it("rolls over the year boundary", () => {
    const { from, to } = monthRange("2024-12");

    expect(from.toISOString()).toBe("2024-12-01T00:00:00.000Z");
    expect(to.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });

  it("handles a leap February", () => {
    const { from, to } = monthRange("2024-02");

    expect(to.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    expect(new Date("2024-02-29") >= from && new Date("2024-02-29") < to).toBe(
      true
    );
  });
});

describe("endOfUtcDay", () => {
  it("closes the day in UTC, not local time", () => {
    expect(endOfUtcDay(new Date("2024-03-15")).toISOString()).toBe(
      "2024-03-15T23:59:59.999Z"
    );
  });

  it("does not mutate its argument", () => {
    const input = new Date("2024-03-15");
    endOfUtcDay(input);

    expect(input.toISOString()).toBe("2024-03-15T00:00:00.000Z");
  });
});
