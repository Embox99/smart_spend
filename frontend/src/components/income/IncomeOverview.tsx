import { useMemo } from "react";
import { LuPlus } from "react-icons/lu";
import type { Income } from "@shared/types";
import CustomBarChart from "../charts/CustomBarChart";
import { prepareIncomeBarChartData } from "../../utils/helper";

interface IncomeOverviewProps {
  transactions: Income[];
  onAddIncome: () => void;
}

const IncomeOverview = ({ transactions, onAddIncome }: IncomeOverviewProps) => {
  const chartData = useMemo(
    () => prepareIncomeBarChartData(transactions),
    [transactions]
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg">Income Overview</h5>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Track your earnings over time and analyze your income trends
          </p>
        </div>
        <button type="button" className="add-btn" onClick={onAddIncome}>
          <LuPlus className="text-lg" />
          Add Income
        </button>
      </div>
      <div className="mt-10">
        <CustomBarChart data={chartData} />
      </div>
    </div>
  );
};

export default IncomeOverview;
