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

    expect(filter.amount).toEqual({ $gte: 10 });
  });

  it("stretches the upper date bound to the end of the day", () => {
    const { filter } = build({ to: "2024-03-15" });
    const upper = (filter.date as { $lte: Date }).$lte;

    expect(upper.getHours()).toBe(23);
    expect(upper.getMinutes()).toBe(59);
  });

  it("escapes regex metacharacters in the search term", () => {
    const { filter } = build({ search: "(a+)+$" });

    expect(filter.category).toEqual({
      $regex: "\\(a\\+\\)\\+\\$",
      $options: "i",
    });
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
