import { LuArrowRight } from "react-icons/lu";
import type { Expense } from "@shared/types";
import TransactionInfoCard from "../cards/TransactionInfoCard";
import { formatFullDate } from "../../utils/helper";

interface ExpenseTransactionProps {
  transactions?: Expense[];
  onSeeMore: () => void;
}

const ExpenseTransaction = ({
  transactions = [],
  onSeeMore,
}: ExpenseTransactionProps) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <h5 className="text-lg">Expenses</h5>
      <button type="button" className="card-btn" onClick={onSeeMore}>
        See All <LuArrowRight className="text-base" />
      </button>
    </div>
    <div className="mt-6">
      {transactions.slice(0, 5).map((expense) => (
        <TransactionInfoCard
          key={expense._id}
          title={expense.category}
          icon={expense.icon}
          note={expense.note}
          date={formatFullDate(expense.date)}
          amount={expense.amount}
          type="expense"
          hideDeleteBtn
        />
      ))}
    </div>
  </div>
);

export default ExpenseTransaction;
