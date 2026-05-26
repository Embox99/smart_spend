import React from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/**
 * Simple pagination control.
 * Props: page, totalPages, onPageChange
 */
const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <span className="text-xs text-gray-400 dark:text-gray-500">
        {total} result{total !== 1 ? "s" : ""}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     border border-gray-200 dark:border-gray-700
                     text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <LuChevronLeft size={15} />
        </button>

        <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     border border-gray-200 dark:border-gray-700
                     text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <LuChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
