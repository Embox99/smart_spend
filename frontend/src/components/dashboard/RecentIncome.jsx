import React from "react";
import { LuArrowRight } from "react-icons/lu";
import { format, parseISO } from "date-fns";
import TransactionInfoCard from "../cards/TransactionInfoCard";

const fmt = (date) => {
  try { return format(typeof date === "string" ? parseISO(date) : new Date(date), "do MMM yyyy"); }
  catch { return date; }
};

const RecentIncome = ({ transactions, onSeeMore }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Income</h5>
        <button className="card-btn" onClick={onSeeMore}>
          See All <LuArrowRight className="text-base" />
        </button>
      </div>
      <div className="mt-6">
        {transactions?.slice(0, 5)?.map((item) => (
          <TransactionInfoCard
            key={item._id}
            title={item.source}
            icon={item.icon}
            date={fmt(item.date)}
            amount={item.amount}
            type="income"
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default RecentIncome;
