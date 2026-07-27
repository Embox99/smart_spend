import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../utils/queryKeys";

type Scope = "income" | "expense" | "budget";

/**
 * Returns an invalidator that refreshes every view a change touches.
 *
 * The dashboard sums both ledgers, and budgets are computed from expenses, so
 * writing one record can leave up to three cached views stale.
 */
export const useInvalidateFinancials = (): ((scope: Scope) => void) => {
  const queryClient = useQueryClient();

  return useCallback(
    (scope: Scope) => {
      const invalidate = (queryKey: readonly unknown[]) =>
        void queryClient.invalidateQueries({ queryKey });

      if (scope === "income") {
        invalidate(queryKeys.income);
        invalidate(queryKeys.dashboard);
        return;
      }

      if (scope === "expense") {
        invalidate(queryKeys.expenses);
        invalidate(queryKeys.dashboard);
        // Spend per category is derived from expenses, for every month.
        invalidate(queryKeys.budgets);
        return;
      }

      invalidate(queryKeys.budgets);
    },
    [queryClient]
  );
};
