import React, { useState } from "react";
import { LuPlus } from "react-icons/lu";
import CustomBarChart from "../charts/CustomBarChart";
import { prepareIncomeBarChartData } from "../../utils/helper";

const IncomeOverview = ({ transactions, onAddIncome }) => {
  const [charData, setCharData] = useState([]);

  useEffect(() => {
    const result = prepareIncomeBarChartData(transactions);
    setCharData(result);

    return () => {};
  }, [transactions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="">
          <h5 className="text-lg"></h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Track your ernings over time and analyze your income trends
          </p>
        </div>
        <button className="add-btn" onClick={onAddIncome}>
          <LuPlus className="text-lg" />
          Add Income
        </button>
      </div>
      <div className=""></div>
    </div>
  );
};

export default IncomeOverview;
