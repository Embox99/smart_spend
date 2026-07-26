import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import CustomTooltip from "./CustomTooltip";
import CustomLegend from "./CustomLegend";
import { useTheme } from "../../context/themeContext";
import type { ChartPoint } from "./chartTypes";

interface CustomPieChartProps {
  data: ChartPoint[];
  label?: string;
  totalAmount?: string;
  colors: string[];
  showTextAnchor?: boolean;
}

const CustomPieChart = ({
  data,
  label,
  totalAmount,
  colors,
  showTextAnchor,
}: CustomPieChartProps) => {
  const { isDark } = useTheme();

  return (
    <ResponsiveContainer width="100%" height={330}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={100}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        {showTextAnchor && (
          <>
            <text
              x="50%"
              y="50%"
              dy={-25}
              textAnchor="middle"
              fill={isDark ? "#9ca3af" : "#6b7280"}
              fontSize="14px"
            >
              {label}
            </text>
            <text
              x="50%"
              y="50%"
              dy={8}
              textAnchor="middle"
              fill={isDark ? "#f3f4f6" : "#111827"}
              fontSize="24px"
              fontWeight="500"
            >
              {totalAmount}
            </text>
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
