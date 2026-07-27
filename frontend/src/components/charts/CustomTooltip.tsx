import type { ChartTooltipProps } from "./chartTypes";
import { useCurrency } from "../../hooks/useCurrency";

const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
  const { format } = useCurrency();
  const entry = payload?.[0];
  if (!active || !entry) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 border border-gray-200 dark:border-gray-700">
      <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
        {entry.name}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Amount:{" "}
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {typeof entry.value === "number" ? format(entry.value) : entry.value}
        </span>
      </p>
    </div>
  );
};

export default CustomTooltip;
