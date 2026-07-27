import { useState } from "react";
import toast from "react-hot-toast";
import type { Expense as ExpenseType } from "@shared/types";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATH } from "../../utils/apiPaths";
import axiosInstance, { apiErrorMessage } from "../../utils/axiosInstance";
import { ExpenseOverview } from "../../components/expense/ExpenseOverview";
import ExpenseForm from "../../components/expense/ExpenseForm";
import {
  toExpenseFormValues,
  type ExpenseFormValues,
} from "../../utils/transactionForm";
import Modal from "../../components/Modal";
import ExpenseList from "../../components/expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";
import useTransactions, { buildParams } from "../../hooks/useTransactions";
import { useInvalidateFinancials } from "../../hooks/useInvalidateFinancials";
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
  } = useTransactions<ExpenseType>(API_PATH.EXPENSE.GET_ALL_EXPENSE);

  const invalidate = useInvalidateFinancials();
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<ExpenseType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const closeForm = () => {
    setIsCreating(false);
    setEditing(null);
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    const { category, amount, date, icon, note } = values;
    if (!category.trim()) return toast.error("Category is required");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Amount must be a positive number");
    }
    if (!date) return toast.error("Date is required");

    const payload = { category, amount: Number(amount), date, icon, note };

    try {
      if (editing) {
        await axiosInstance.put(
          API_PATH.EXPENSE.UPDATE_EXPENSE(editing._id),
          payload
        );
      } else {
        await axiosInstance.post(API_PATH.EXPENSE.ADD_EXPENSE, payload);
      }
      toast.success(editing ? "Expense updated" : "Expense added successfully");
      closeForm();
      invalidate("expense");
    } catch (err) {
      toast.error(
        apiErrorMessage(err, `Failed to ${editing ? "update" : "add"} expense`)
      );
    }
  };

  const deleteExpense = async () => {
    if (!deleteId) return;
    try {
      await axiosInstance.delete(API_PATH.EXPENSE.DELETE_EXPENSE(deleteId));
      setDeleteId(null);
      toast.success("Expense deleted successfully");
      invalidate("expense");
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
            onExpenseIncome={() => setIsCreating(true)}
          />
          <ExpenseList
            transactions={expenseData}
            pagination={pagination}
            loading={loading}
            filters={filters}
            onFilterChange={setFilter}
            onFilterClear={clearFilters}
            onPageChange={setPage}
            onEdit={(id) =>
              setEditing(expenseData.find((e) => e._id === id) ?? null)
            }
            onDelete={setDeleteId}
            onDownload={handleDownload}
          />
        </div>

        <Modal
          isOpen={isCreating || editing !== null}
          onClose={closeForm}
          title={editing ? "Edit Expense" : "Add Expense"}
        >
          {/* Keyed so switching records remounts the form with fresh state. */}
          <ExpenseForm
            key={editing?._id ?? "new"}
            onSubmit={handleSubmit}
            initialValues={editing ? toExpenseFormValues(editing) : undefined}
            submitLabel={editing ? "Save Changes" : "Add Expense"}
          />
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
