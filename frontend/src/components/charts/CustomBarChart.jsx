import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const getBarColor = (index) =>
  index % 2 === 0 ? "#875cf5" : "#cfbefb";

const BarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
          {payload[0].payload.category}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Amount:{" "}
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            ${payload[0].payload.amount}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarChart = ({ data }) => {
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const tickColor = isDark ? "#9ca3af" : "#555";

  return (
    <div className="mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} stroke="none" />
          <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke="none" />
          <Tooltip content={<BarTooltip />} />
          <Bar dataKey="amount" fill="#875cf5" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
