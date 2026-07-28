import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Paginated, Pagination, TransactionFilters } from "@shared/types";
import axiosInstance from "../utils/axiosInstance";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 350;

const EMPTY_FILTERS: TransactionFilters = {
  search: "",
  from: "",
  to: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  order: "desc",
};

export const buildParams = (
  filters: TransactionFilters,
  page?: number
): URLSearchParams => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value != null) params.set(key, String(value));
  }
  if (page) {
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
  }
  return params;
};

export interface UseTransactionsResult<T> {
  data: T[];
  pagination: Pagination | null;
  loading: boolean;
  filters: TransactionFilters;
  page: number;
  setFilter: <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
}

const useTransactions = <T>(endpoint: string): UseTransactionsResult<T> => {
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // Only the search box needs debouncing — it fires per keystroke. Picking a
  // date or changing the sort is a single deliberate act and should apply at
  // once, so those bypass the delay.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(filters.search),
      DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [filters.search]);

  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const { data, isFetching } = useQuery({
    queryKey: [endpoint, effectiveFilters, page],
    queryFn: async () => {
      const params = buildParams(effectiveFilters, page);
      const res = await axiosInstance.get<Paginated<T>>(
        `${endpoint}?${params.toString()}`
      );
      return res.data;
    },
    // Keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,
  });

  const setFilter = useCallback<UseTransactionsResult<T>["setFilter"]>(
    (key, value) => {
      setFilters((f) => ({ ...f, [key]: value }));
      setPage(1);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  return useMemo(
    () => ({
      data: data?.data ?? [],
      pagination: data?.pagination ?? null,
      loading: isFetching,
      filters,
      page,
      setFilter,
      clearFilters,
      setPage,
    }),
    [data, isFetching, filters, page, setFilter, clearFilters]
  );
};

export default useTransactions;
