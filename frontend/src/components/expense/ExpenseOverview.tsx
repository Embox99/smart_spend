import { useMemo } from "react";
import { LuPlus } from "react-icons/lu";
import type { Expense } from "@shared/types";
import { prepareExpenseLineChartData } from "../../utils/helper";
import { CustomLineChart } from "../charts/CustomLineChart";

interface ExpenseOverviewProps {
  transactions: Expense[];
  onExpenseIncome: () => void;
}

export const ExpenseOverview = ({
  transactions,
  onExpenseIncome,
}: ExpenseOverviewProps) => {
  const chartData = useMemo(
    () => prepareExpenseLineChartData(transactions),
    [transactions]
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg">Expense Overview</h5>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Track your spending trends over time and gain insights where your
            money goes.
          </p>
        </div>
        <button type="button" className="add-btn" onClick={onExpenseIncome}>
          <LuPlus className="text-lg" />
          Add Expense
        </button>
      </div>
      <div className="mt-10">
        <CustomLineChart data={chartData} />
      </div>
    </div>
  );
};
