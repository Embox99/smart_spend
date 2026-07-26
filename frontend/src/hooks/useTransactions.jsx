import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 350;

const EMPTY_FILTERS = {
  search: "",
  from: "",
  to: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  order: "desc",
};

export const buildParams = (filters, page) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== "" && v !== undefined && v !== null) params.set(k, v);
  });
  if (page) {
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
  }
  return params;
};

const useTransactions = (endpoint) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Typing in the search box should not fire a request per keystroke.
  const [debouncedFilters, setDebouncedFilters] = useState(EMPTY_FILTERS);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters]);

  const { data, isFetching } = useQuery({
    queryKey: [endpoint, debouncedFilters, page],
    queryFn: async () => {
      const params = buildParams(debouncedFilters, page);
      const res = await axiosInstance.get(`${endpoint}?${params}`);
      return res.data;
    },
    // Keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,
  });

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [endpoint] }),
    [queryClient, endpoint]
  );

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
      refresh,
    }),
    [data, isFetching, filters, page, setFilter, clearFilters, refresh]
  );
};

export default useTransactions;
