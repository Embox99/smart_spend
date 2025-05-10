import React from "react";
import CustomPieChart from "../charts/CustomPieChart";

const COLORS = ["#875CF5", "#FA2c37", "#FF6900"];

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
  const balanceData = [
    { name: "totalBalance", amount: totalBalance },
    { name: "totalIncome", amount: totalIncome },
    { name: "totalExpense", amount: totalExpense },
  ];

  return (
    <div className="card">
      <div className="flext items-center justify-between">
        <h5 className="text-lg">Finance Overview</h5>
      </div>
      <CustomPieChart
        data={balanceData}
        label="Total Balance"
        totalAmount={`${totalBalance}`}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  );
};

export default FinanceOverview;
