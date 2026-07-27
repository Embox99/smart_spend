import CustomPieChart from "../charts/CustomPieChart";
import { formatAmountCompact } from "../../utils/money";

const COLORS = ["#875CF5", "#FA2C37", "#FF6900"];

interface FinanceOverviewProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

const FinanceOverview = ({
  totalBalance,
  totalIncome,
  totalExpense,
}: FinanceOverviewProps) => {
  const balanceData = [
    { label: "Total Balance", amount: totalBalance },
    { label: "Total Income", amount: totalIncome },
    { label: "Total Expense", amount: totalExpense },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Finance Overview</h5>
      </div>
      <CustomPieChart
        data={balanceData}
        label="Total Balance"
        totalAmount={formatAmountCompact(totalBalance)}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  );
};

export default FinanceOverview;
