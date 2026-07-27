import { useCallback, useMemo } from "react";
import { useUser } from "./useUser";
import {
  DEFAULT_CURRENCY,
  formatAmount,
  formatAmountCompact,
} from "../utils/money";

interface UseCurrencyResult {
  currency: string;
  /** "$1,234.56" — always two decimals. */
  format: (minor: number) => string;
  /** Drops the decimals on whole amounts, for headline figures. */
  formatCompact: (minor: number) => string;
}

/**
 * Formats amounts in the signed-in user's currency, falling back to the
 * default before the profile has loaded.
 */
export const useCurrency = (): UseCurrencyResult => {
  const { user } = useUser();
  const currency = user?.currency ?? DEFAULT_CURRENCY;

  const format = useCallback(
    (minor: number) => formatAmount(minor, currency),
    [currency]
  );

  const formatCompact = useCallback(
    (minor: number) => formatAmountCompact(minor, currency),
    [currency]
  );

  return useMemo(
    () => ({ currency, format, formatCompact }),
    [currency, format, formatCompact]
  );
};
