import { describe, expect, it } from "vitest";
import buildQuery from "./buildQuery";

const build = (params: Record<string, string>) =>
  buildQuery(params, "category");

describe("buildQuery", () => {
  it("defaults to newest first, page 1, 20 per page", () => {
    const { filter, sort, skip, limit, page } = build({});

    expect(filter).toEqual({});
    expect(sort).toEqual({ date: -1 });
    expect(skip).toBe(0);
    expect(limit).toBe(20);
    expect(page).toBe(1);
  });

  it("omits a range entirely when its bounds do not parse", () => {
    // An empty {} here would be matched literally by Mongo and return nothing.
    const { filter } = build({ minAmount: "abc", from: "not-a-date" });

    expect(filter).not.toHaveProperty("amount");
    expect(filter).not.toHaveProperty("date");
  });

  it("keeps the bound that does parse", () => {
    const { filter } = build({ minAmount: "10", maxAmount: "oops" });

    expect(filter.amount).toEqual({ $gte: 1000 }); // decimals in, cents out
  });

  it("stretches the upper date bound to the end of the day in UTC", () => {
    const { filter } = build({ to: "2024-03-15" });
    const upper = (filter.date as { $lte: Date }).$lte;

    // Asserted as an instant — local getters would shift with the server zone.
    expect(upper.toISOString()).toBe("2024-03-15T23:59:59.999Z");
  });

  it("keeps a transaction dated the boundary day inside the range", () => {
    const { filter } = build({ from: "2024-03-01", to: "2024-03-31" });
    const { $gte, $lte } = filter.date as { $gte: Date; $lte: Date };

    expect(new Date("2024-03-01") >= $gte).toBe(true);
    expect(new Date("2024-03-31") <= $lte).toBe(true);
  });

  it("escapes regex metacharacters in the search term", () => {
    const { filter } = build({ search: "(a+)+$" });
    const pattern = { $regex: "\\(a\\+\\)\\+\\$", $options: "i" };

    // Search spans the labelled field and the free-text note.
    expect(filter.$or).toEqual([{ category: pattern }, { note: pattern }]);
  });

  it("ignores a sort field that is not whitelisted", () => {
    expect(build({ sortBy: "password" }).sort).toEqual({ date: -1 });
    expect(build({ sortBy: "amount", order: "asc" }).sort).toEqual({
      amount: 1,
    });
  });

  it("clamps the page size to 100 and the page number to 1", () => {
    expect(build({ limit: "5000" }).limit).toBe(100);
    expect(build({ limit: "0" }).limit).toBe(20);
    expect(build({ page: "-3" }).page).toBe(1);
  });
});
