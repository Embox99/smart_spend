import { useMemo } from "react";
import type { Expense } from "@shared/types";
import { prepareExpenseBarChartData } from "../../utils/helper";
import CustomBarChart from "../charts/CustomBarChart";

const Last30DaysExpenses = ({ data }: { data: Expense[] }) => {
  const chartData = useMemo(() => prepareExpenseBarChartData(data), [data]);

  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Last 30 Days Expenses</h5>
      </div>
      {/* This series is grouped by category, not by date. */}
      <CustomBarChart data={chartData} xKey="category" />
    </div>
  );
};

export default Last30DaysExpenses;
