import { LuArrowRight } from "react-icons/lu";
import type { Income } from "@shared/types";
import TransactionInfoCard from "../cards/TransactionInfoCard";
import { formatFullDate } from "../../utils/helper";

interface RecentIncomeProps {
  transactions?: Income[];
  onSeeMore: () => void;
}

const RecentIncome = ({ transactions = [], onSeeMore }: RecentIncomeProps) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <h5 className="text-lg">Income</h5>
      <button type="button" className="card-btn" onClick={onSeeMore}>
        See All <LuArrowRight className="text-base" />
      </button>
    </div>
    <div className="mt-6">
      {transactions.slice(0, 5).map((item) => (
        <TransactionInfoCard
          key={item._id}
          title={item.source}
          icon={item.icon}
          note={item.note}
          date={formatFullDate(item.date)}
          amount={item.amount}
          type="income"
          hideDeleteBtn
        />
      ))}
    </div>
  </div>
);

export default RecentIncome;
