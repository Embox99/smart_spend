import { useState } from "react";
import toast from "react-hot-toast";
import type { Expense as ExpenseType } from "@shared/types";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATH } from "../../utils/apiPaths";
import axiosInstance, { apiErrorMessage } from "../../utils/axiosInstance";
import { ExpenseOverview } from "../../components/expense/ExpenseOverview";
import AddExpenseForm, {
  type ExpenseFormValues,
} from "../../components/expense/AddExpenseForm";
import Modal from "../../components/Modal";
import ExpenseList from "../../components/expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";
import useTransactions, { buildParams } from "../../hooks/useTransactions";
import downloadFile from "../../utils/download";

const Expense = () => {
  const {
    data: expenseData,
    pagination,
    loading,
    filters,
    setFilter,
    clearFilters,
    setPage,
    refresh,
  } = useTransactions<ExpenseType>(API_PATH.EXPENSE.GET_ALL_EXPENSE);

  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddExpense = async (expense: ExpenseFormValues) => {
    const { category, amount, date, icon } = expense;
    if (!category.trim()) return toast.error("Category is required");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Amount must be a positive number");
    }
    if (!date) return toast.error("Date is required");

    try {
      await axiosInstance.post(API_PATH.EXPENSE.ADD_EXPENSE, {
        category,
        amount: Number(amount),
        date,
        icon,
      });
      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      refresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to add expense"));
    }
  };

  const deleteExpense = async () => {
    if (!deleteId) return;
    try {
      await axiosInstance.delete(API_PATH.EXPENSE.DELETE_EXPENSE(deleteId));
      setDeleteId(null);
      toast.success("Expense deleted successfully");
      refresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete expense"));
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile(
        `${API_PATH.EXPENSE.DOWNLOAD_EXPENSE}?${buildParams(filters)}`,
        "expense_details.xlsx"
      );
    } catch {
      toast.error("Failed to download. Please try again.");
    }
  };

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <ExpenseOverview
            transactions={expenseData}
            onExpenseIncome={() => setOpenAddExpenseModal(true)}
          />
          <ExpenseList
            transactions={expenseData}
            pagination={pagination}
            loading={loading}
            filters={filters}
            onFilterChange={setFilter}
            onFilterClear={clearFilters}
            onPageChange={setPage}
            onDelete={setDeleteId}
            onDownload={handleDownload}
          />
        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>

        <Modal
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense?"
            onDelete={deleteExpense}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
