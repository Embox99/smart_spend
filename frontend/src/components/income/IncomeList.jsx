import React from "react";
import { LuDownload } from "react-icons/lu";
import { format, parseISO } from "date-fns";
import TransactionInfoCard from "../cards/TransactionInfoCard";
import FilterBar from "../filters/FilterBar";
import Pagination from "../filters/Pagination";

const fmt = (date) => {
  try { return format(typeof date === "string" ? parseISO(date) : new Date(date), "do MMM yyyy"); }
  catch { return date; }
};

const IncomeList = ({
  transactions,
  pagination,
  loading,
  filters,
  onFilterChange,
  onFilterClear,
  onPageChange,
  onDelete,
  onDownload,
}) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg">Income Sources</h5>
        <button type="button" className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      <FilterBar
        filters={filters}
        onChange={onFilterChange}
        onClear={onFilterClear}
        searchLabel="Source"
      />

      {loading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
          No income matches your filters
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2">
          {transactions.map((income) => (
            <TransactionInfoCard
              key={income._id}
              title={income.source}
              icon={income.icon}
              date={fmt(income.date)}
              amount={income.amount}
              type="income"
              onDelete={() => onDelete(income._id)}
            />
          ))}
        </div>
      )}

      <Pagination
        page={pagination?.page ?? 1}
        totalPages={pagination?.totalPages ?? 1}
        total={pagination?.total ?? 0}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default IncomeList;
