import type { CategoryTotal } from "@shared/types";
import CustomBarChart from "../charts/CustomBarChart";

/** Already grouped by category server-side — one bar per category. */
const Last30DaysExpenses = ({ data }: { data: CategoryTotal[] }) => (
  <div className="card col-span-1">
    <div className="flex items-center justify-between">
      <h5 className="text-lg">Last 30 Days Expenses</h5>
    </div>
    {data.length === 0 ? (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-16">
        No expenses in the last 30 days
      </p>
    ) : (
      <CustomBarChart data={data} />
    )}
  </div>
);

export default Last30DaysExpenses;
