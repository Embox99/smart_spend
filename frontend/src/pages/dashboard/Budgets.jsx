import React, { useEffect, useState } from "react";
import { LuPlus, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/DeleteAlert";
import BudgetCard from "../../components/budget/BudgetCard";
import AddBudgetForm from "../../components/budget/AddBudgetForm";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPaths";

const toMonthStr = (d) => format(d, "yyyy-MM");
const fromMonthStr = (s) => parseISO(`${s}-01`);
const displayMonth = (s) => format(fromMonthStr(s), "MMMM yyyy");

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(toMonthStr(new Date()));
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${API_PATH.BUDGET.GET_BUDGETS}?month=${month}`
      );
      setBudgets(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, [month]);

  const handleAdd = async (data) => {
    try {
      await axiosInstance.post(API_PATH.BUDGET.UPSERT_BUDGET, data);
      setShowAddModal(false);
      toast.success("Budget saved");
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save budget");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(API_PATH.BUDGET.DELETE_BUDGET(deleteAlert.id));
      setDeleteAlert({ show: false, id: null });
      toast.success("Budget deleted");
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete budget");
    }
  };

  const prevMonth = () => setMonth((m) => toMonthStr(subMonths(fromMonthStr(m), 1)));
  const nextMonth = () => setMonth((m) => toMonthStr(addMonths(fromMonthStr(m), 1)));

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter((b) => b.percentUsed >= 100).length;

  return (
    <DashboardLayout activeMenu="Budgets">
      <div className="my-5 mx-auto">

        {/* ── header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="text-xl font-medium text-gray-900 dark:text-white">Budgets</h4>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              Set monthly spending limits per category
            </p>
          </div>
          <button
            className="add-btn add-btn-fill self-start sm:self-auto"
            onClick={() => setShowAddModal(true)}
          >
            <LuPlus className="text-lg" /> Add Budget
          </button>
        </div>

        {/* ── month navigator ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       border border-gray-200 dark:border-gray-700
                       text-gray-600 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Previous month"
          >
            <LuChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[120px] text-center">
            {displayMonth(month)}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       border border-gray-200 dark:border-gray-700
                       text-gray-600 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Next month"
          >
            <LuChevronRight size={16} />
          </button>
        </div>

        {/* ── summary strip ── */}
        {budgets.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total limit",  value: `$${totalLimit.toLocaleString()}` },
              { label: "Total spent",  value: `$${totalSpent.toLocaleString()}` },
              { label: "Over budget",  value: overBudget,
                danger: overBudget > 0 },
            ].map(({ label, value, danger }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                <p className={`text-xl font-medium ${danger ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── budget cards grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-violet-50 dark:bg-violet-900/20 text-2xl mb-4">
              🎯
            </div>
            <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              No budgets for {displayMonth(month)}
            </h6>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Set spending limits to track your expenses
            </p>
            <button className="add-btn add-btn-fill" onClick={() => setShowAddModal(true)}>
              <LuPlus className="text-lg" /> Add your first budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {budgets.map((b) => (
              <BudgetCard
                key={b._id}
                budget={b}
                onDelete={(id) => setDeleteAlert({ show: true, id })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── modals ── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Budget"
      >
        <AddBudgetForm onAdd={handleAdd} />
      </Modal>

      <Modal
        isOpen={deleteAlert.show}
        onClose={() => setDeleteAlert({ show: false, id: null })}
        title="Delete Budget"
      >
        <DeleteAlert
          content="Are you sure you want to delete this budget? This won't affect your transactions."
          onDelete={handleDelete}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Budgets;
