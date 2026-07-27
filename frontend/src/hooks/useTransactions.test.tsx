import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import useTransactions from "./useTransactions";
import axiosInstance from "../utils/axiosInstance";

const ENDPOINT = "/api/v1/expense/get";

let queryClient: QueryClient;
const get = vi.spyOn(axiosInstance, "get");

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const requested = (fragment: string) =>
  get.mock.calls.some((call) => String(call[0]).includes(fragment));

/**
 * Lets pending promises settle without moving the clock, so a request that
 * only a debounce timer would release stays unsent.
 */
const flushMicrotasks = () => act(async () => {});

const mount = async () => {
  const rendered = renderHook(() => useTransactions(ENDPOINT), { wrapper });
  await flushMicrotasks();
  get.mockClear();
  return rendered;
};

beforeEach(() => {
  // No auto-advance: timers move only when a test says so.
  vi.useFakeTimers();
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  get.mockResolvedValue({ data: { data: [], pagination: null } } as never);
});

afterEach(() => {
  get.mockReset();
  vi.useRealTimers();
});

describe("useTransactions", () => {
  it("applies a sort change without waiting for the debounce", async () => {
    const { result } = await mount();

    act(() => result.current.setFilter("sortBy", "amount"));
    await flushMicrotasks();

    // The clock has not moved; a debounced filter would still be pending.
    expect(requested("sortBy=amount")).toBe(true);
  });

  it("applies a date change without waiting for the debounce", async () => {
    const { result } = await mount();

    act(() => result.current.setFilter("from", "2024-03-01"));
    await flushMicrotasks();

    expect(requested("from=2024-03-01")).toBe(true);
  });

  it("applies a page change without waiting for the debounce", async () => {
    const { result } = await mount();

    act(() => result.current.setPage(2));
    await flushMicrotasks();

    expect(requested("page=2")).toBe(true);
  });

  it("holds a search change back until typing settles", async () => {
    const { result } = await mount();

    act(() => result.current.setFilter("search", "cof"));
    await flushMicrotasks();
    expect(requested("search=cof")).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(requested("search=cof")).toBe(true);
  });

  it("sends only the last keystroke of a burst", async () => {
    const { result } = await mount();

    for (const term of ["c", "co", "cof"]) {
      act(() => result.current.setFilter("search", term));
      await flushMicrotasks();
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(requested("search=c&")).toBe(false);
    expect(requested("search=co&")).toBe(false);
    expect(requested("search=cof")).toBe(true);
  });

  it("resets to the first page when a filter changes", async () => {
    const { result } = await mount();

    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);

    act(() => result.current.setFilter("sortBy", "amount"));

    expect(result.current.page).toBe(1);
  });
});
