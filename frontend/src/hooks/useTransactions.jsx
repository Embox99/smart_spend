import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";

const EMPTY_FILTERS = {
  search: "",
  from: "",
  to: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  order: "desc",
};

const useTransactions = (endpoint) => {
  const [filters, setFilters]           = useState(EMPTY_FILTERS);
  const [page, setPage]                 = useState(1);
  const [data, setData]                 = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [loading, setLoading]           = useState(false);

  // Debounce timer ref — avoids firing on every keystroke
  const debounceTimer = useRef(null);

  const fetchData = useCallback(
    async (currentFilters, currentPage) => {
      setLoading(true);
      try {
        // Build query string — omit empty values
        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([k, v]) => {
          if (v !== "" && v !== undefined) params.set(k, v);
        });
        params.set("page", currentPage);
        params.set("limit", "20");

        const res = await axiosInstance.get(`${endpoint}?${params.toString()}`);
        setData(res.data.data || []);
        setPagination(res.data.pagination || null);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchData(filters, page);
    }, 350);
    return () => clearTimeout(debounceTimer.current);
  }, [filters, page, fetchData]);

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1); 
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);


  const refresh = useCallback(() => {
    fetchData(filters, page);
  }, [fetchData, filters, page]);

  return {
    data,
    pagination,
    loading,
    filters,
    page,
    setFilter,
    clearFilters,
    setPage,
    refresh,
  };
};

export default useTransactions;
