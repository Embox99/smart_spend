import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useInvalidateFinancials } from "./useInvalidateFinancials";
import { queryKeys } from "../utils/queryKeys";

let queryClient: QueryClient;
let invalidated: QueryKey[];

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const renderInvalidator = () =>
  renderHook(() => useInvalidateFinancials(), { wrapper }).result.current;

/** Did any invalidation target this key (or a prefix of it)? */
const hit = (key: readonly unknown[]) =>
  invalidated.some((k) => JSON.stringify(k) === JSON.stringify(key));

beforeEach(() => {
  queryClient = new QueryClient();
  invalidated = [];
  vi.spyOn(queryClient, "invalidateQueries").mockImplementation(
    async (filters) => {
      if (filters?.queryKey) invalidated.push(filters.queryKey);
    }
  );
});

describe("useInvalidateFinancials", () => {
  it("refreshes the dashboard after an income change", () => {
    renderInvalidator()("income");

    expect(hit(queryKeys.income)).toBe(true);
    expect(hit(queryKeys.dashboard)).toBe(true);
  });

  it("refreshes the dashboard and budgets after an expense change", () => {
    // Budgets derive spend from expenses, so both are stale.
    renderInvalidator()("expense");

    expect(hit(queryKeys.expenses)).toBe(true);
    expect(hit(queryKeys.dashboard)).toBe(true);
    expect(hit(queryKeys.budgets)).toBe(true);
  });

  it("invalidates budgets across every month, not just the visible one", () => {
    renderInvalidator()("expense");

    // A bare ["budgets"] prefix covers ["budgets", "2024-03"] and siblings.
    expect(invalidated).toContainEqual(queryKeys.budgets);
  });

  it("leaves the ledgers alone when only a budget changed", () => {
    renderInvalidator()("budget");

    expect(hit(queryKeys.budgets)).toBe(true);
    expect(hit(queryKeys.expenses)).toBe(false);
    expect(hit(queryKeys.income)).toBe(false);
  });
});
