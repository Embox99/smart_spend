import { LuArrowRight } from "react-icons/lu";
import type { RecentTransaction } from "@shared/types";
import TransactionInfoCard from "../cards/TransactionInfoCard";
import { formatFullDate } from "../../utils/helper";

interface RecentTransactionsProps {
  transactions?: RecentTransaction[];
  onSeeMore: () => void;
}

const RecentTransactions = ({
  transactions = [],
  onSeeMore,
}: RecentTransactionsProps) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <h5 className="text-lg">Recent Transactions</h5>
      <button type="button" className="card-btn" onClick={onSeeMore}>
        See All <LuArrowRight className="text-base" />
      </button>
    </div>
    <div className="mt-6">
      {transactions.slice(0, 5).map((item) => (
        <TransactionInfoCard
          key={item._id}
          title={"category" in item ? item.category : item.source}
          icon={item.icon}
          date={formatFullDate(item.date)}
          amount={item.amount}
          type={item.type}
          hideDeleteBtn
        />
      ))}
    </div>
  </div>
);

export default RecentTransactions;
