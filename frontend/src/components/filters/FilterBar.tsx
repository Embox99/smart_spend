import { useState } from "react";
import { LuSearch, LuSlidersHorizontal, LuX } from "react-icons/lu";
import type { SortBy, SortOrder, TransactionFilters } from "@shared/types";

interface FilterBarProps {
  filters: TransactionFilters;
  onChange: <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => void;
  onClear: () => void;
  /** Placeholder noun for the search box — "Category", "Source"… */
  searchLabel?: string;
}

const FilterBar = ({
  filters,
  onChange,
  onClear,
  searchLabel = "Search",
}: FilterBarProps) => {
  const [expanded, setExpanded] = useState(false);

  const hasActive = Boolean(
    filters.search ||
    filters.from ||
    filters.to ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.sortBy !== "date" ||
    filters.order !== "desc"
  );

  return (
    <div className="mb-4">
      {/* ── top row: search + toggle ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LuSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            aria-label={`Search by ${searchLabel.toLowerCase()}`}
            placeholder={`Search by ${searchLabel.toLowerCase()}…`}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg
                       bg-gray-50 dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       text-gray-900 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-gray-500
                       outline-none focus:border-violet-400 dark:focus:border-violet-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors
            ${
              expanded || hasActive
                ? "border-violet-400 dark:border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
            }`}
        >
          <LuSlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {hasActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
          )}
        </button>

        {hasActive && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg
                       border border-gray-200 dark:border-gray-700
                       text-gray-500 dark:text-gray-400
                       bg-gray-50 dark:bg-gray-800
                       hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Clear all filters"
          >
            <LuX size={15} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* ── expanded panel ── */}
      {expanded && (
        <div className="mt-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              From
              <input
                type="date"
                value={filters.from}
                onChange={(e) => onChange("from", e.target.value)}
                className="filter-input"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              To
              <input
                type="date"
                value={filters.to}
                onChange={(e) => onChange("to", e.target.value)}
                className="filter-input"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Min amount
              <input
                type="number"
                min="0"
                value={filters.minAmount}
                onChange={(e) => onChange("minAmount", e.target.value)}
                placeholder="0"
                className="filter-input"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Max amount
              <input
                type="number"
                min="0"
                value={filters.maxAmount}
                onChange={(e) => onChange("maxAmount", e.target.value)}
                placeholder="∞"
                className="filter-input"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Sort by
              <select
                value={filters.sortBy}
                onChange={(e) => onChange("sortBy", e.target.value as SortBy)}
                className="filter-input"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Order
              <select
                value={filters.order}
                onChange={(e) => onChange("order", e.target.value as SortOrder)}
                className="filter-input"
              >
                <option value="desc">Newest / Highest first</option>
                <option value="asc">Oldest / Lowest first</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
