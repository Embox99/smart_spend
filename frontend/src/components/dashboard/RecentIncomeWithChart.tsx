import type { CategoryTotal } from "@shared/types";
import CustomPieChart from "../charts/CustomPieChart";

const COLORS = ["#875CF5", "#FA2C37", "#FF6900", "#4f39f6"];

interface RecentIncomeWithChartProps {
  /** Top sources by amount, grouped server-side. */
  data: CategoryTotal[];
  totalIncome: number;
}

const RecentIncomeWithChart = ({
  data,
  totalIncome,
}: RecentIncomeWithChartProps) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <h5 className="text-lg">Last 60 Days Income</h5>
    </div>
    {data.length === 0 ? (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-16">
        No income in the last 60 days
      </p>
    ) : (
      <CustomPieChart
        data={data.slice(0, COLORS.length)}
        label="Total Income"
        totalAmount={`${totalIncome}`}
        showTextAnchor
        colors={COLORS}
      />
    )}
  </div>
);

export default RecentIncomeWithChart;
