import { describe, expect, it } from "vitest";
import type { TransactionFilters } from "@shared/types";
import { buildParams } from "./useTransactions";

const filters: TransactionFilters = {
  search: "",
  from: "",
  to: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  order: "desc",
};

describe("buildParams", () => {
  it("drops empty filters so the server sees no blank values", () => {
    const params = buildParams(filters);

    expect(params.has("search")).toBe(false);
    expect(params.get("sortBy")).toBe("date");
    expect(params.get("order")).toBe("desc");
  });

  it("keeps values that are set", () => {
    const params = buildParams({
      ...filters,
      search: "coffee",
      minAmount: "10",
    });

    expect(params.get("search")).toBe("coffee");
    expect(params.get("minAmount")).toBe("10");
  });

  it("adds paging only when a page is requested", () => {
    expect(buildParams(filters).has("page")).toBe(false);

    const paged = buildParams(filters, 3);
    expect(paged.get("page")).toBe("3");
    expect(paged.get("limit")).toBe("20");
  });

  it("percent-encodes values instead of injecting them raw", () => {
    const params = buildParams({ ...filters, search: "a&b=c" });

    expect(params.toString()).toContain("search=a%26b%3Dc");
  });
});
