import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { useTheme } from "../../context/themeContext";
import { useCurrency } from "../../hooks/useCurrency";
import type { ChartPoint, ChartTooltipProps } from "./chartTypes";

const LineTooltip = ({ active, payload }: ChartTooltipProps) => {
  const { format } = useCurrency();
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 border border-gray-200 dark:border-gray-700">
      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
        {point.label}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Amount:{" "}
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {format(point.amount)}
        </span>
      </p>
    </div>
  );
};

export const CustomLineChart = ({ data }: { data: ChartPoint[] }) => {
  const { formatCompact } = useCurrency();
  const { isDark } = useTheme();
  const tickColor = isDark ? "#9ca3af" : "#555";

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#875cf5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#875cf5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="none" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: tickColor }}
            stroke="none"
          />
          <YAxis
            tick={{ fontSize: 12, fill: tickColor }}
            stroke="none"
            tickFormatter={formatCompact}
          />
          <Tooltip content={<LineTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#875cf5"
            fill="url(#incomeGradient)"
            strokeWidth={3}
            dot={{ r: 3, fill: "#ab8df8" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
