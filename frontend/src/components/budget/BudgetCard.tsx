import { LuTrash2, LuUtensils } from "react-icons/lu";
import { formatAmount } from "../../utils/money";
import type { BudgetWithSpend } from "@shared/types";

const getProgressColor = (pct: number) => {
  if (pct >= 100)
    return {
      bar: "bg-red-500 dark:bg-red-500",
      text: "text-red-600 dark:text-red-400",
    };
  if (pct >= 80)
    return {
      bar: "bg-amber-400 dark:bg-amber-400",
      text: "text-amber-600 dark:text-amber-400",
    };
  return {
    bar: "bg-violet-500 dark:bg-violet-400",
    text: "text-violet-600 dark:text-violet-400",
  };
};

interface BudgetCardProps {
  budget: BudgetWithSpend;
  onDelete: (id: string) => void;
}

const BudgetCard = ({ budget, onDelete }: BudgetCardProps) => {
  const { category, limit, spent, remaining, percentUsed, icon } = budget;
  const colors = getProgressColor(percentUsed);
  const barWidth = Math.min(percentUsed, 100);

  return (
    <div className="card group relative">
      <button
        type="button"
        onClick={() => onDelete(budget._id)}
        className="absolute top-4 right-4 text-gray-300 dark:text-gray-600
                   hover:text-red-500 dark:hover:text-red-400
                   opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
        aria-label={`Delete ${category} budget`}
      >
        <LuTrash2 size={16} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 flex items-center justify-center text-lg bg-violet-50 dark:bg-violet-900/20 rounded-lg">
          {icon ? (
            <img src={icon} alt="" className="w-6 h-6" />
          ) : (
            <LuUtensils className="text-violet-500" />
          )}
        </div>
        <div>
          <h6 className="font-medium text-gray-900 dark:text-white text-sm">
            {category}
          </h6>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Monthly limit
          </p>
        </div>
        <span className={`ml-auto text-sm font-medium ${colors.text}`}>
          {percentUsed}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Amounts */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          Spent:{" "}
          <span className="font-medium text-gray-800 dark:text-gray-200">
            ${formatAmount(spent)}
          </span>
        </span>
        <span>
          Left:{" "}
          <span
            className={`font-medium ${
              remaining === 0
                ? "text-red-500"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            ${formatAmount(remaining)}
          </span>{" "}
          / ${formatAmount(limit)}
        </span>
      </div>

      {percentUsed >= 100 && (
        <p className="mt-2 text-xs text-red-500 dark:text-red-400 font-medium">
          Over budget by ${formatAmount(spent - limit)}
        </p>
      )}
      {percentUsed >= 80 && percentUsed < 100 && (
        <p className="mt-2 text-xs text-amber-500 dark:text-amber-400 font-medium">
          Almost at limit — ${formatAmount(remaining)} left
        </p>
      )}
    </div>
  );
};

export default BudgetCard;
