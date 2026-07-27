import {
  LuUtensils,
  LuTrendingUp,
  LuTrendingDown,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";
import { formatAmount } from "../../utils/money";

interface TransactionInfoCardProps {
  title: string;
  icon?: string | null;
  note?: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  /** Hides both row actions — used by the read-only dashboard feeds. */
  hideDeleteBtn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const actionClass = `text-gray-400 opacity-0 group-hover:opacity-100
  focus-visible:opacity-100 transition-opacity cursor-pointer`;

const TransactionInfoCard = ({
  title,
  icon,
  note,
  date,
  amount,
  type,
  hideDeleteBtn,
  onEdit,
  onDelete,
}: TransactionInfoCardProps) => {
  const amountStyles =
    type === "income"
      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
      : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400";

  return (
    <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
      <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full">
        {icon ? (
          <img src={icon} alt={title} className="w-6 h-6" />
        ) : (
          <LuUtensils />
        )}
      </div>

      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
            {title}
          </p>
          {note && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 max-w-md">
              {note}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{date}</p>
        </div>
        <div className="flex items-center gap-2">
          {!hideDeleteBtn && (
            <>
              {onEdit && (
                <button
                  type="button"
                  aria-label={`Edit ${title}`}
                  className={`${actionClass} hover:text-violet-500 dark:hover:text-violet-400`}
                  onClick={onEdit}
                >
                  <LuPencil size={17} />
                </button>
              )}
              <button
                type="button"
                aria-label={`Delete ${title}`}
                className={`${actionClass} hover:text-red-500 dark:hover:text-red-400`}
                onClick={onDelete}
              >
                <LuTrash2 size={18} />
              </button>
            </>
          )}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${amountStyles}`}
          >
            <h6 className="text-xs font-medium">
              {type === "income" ? "+" : "-"} ${formatAmount(amount)}
            </h6>
            {type === "income" ? <LuTrendingUp /> : <LuTrendingDown />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfoCard;
