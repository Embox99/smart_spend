import React, { useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATH } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { ExpenseOverview } from "../../components/expense/ExpenseOverview";
import AddExpenseForm from "../../components/expense/AddExpenseForm";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import ExpenseList from "../../components/expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";
import useTransactions from "../../hooks/useTransactions";

const Expense = () => {
  const {
    data: expenseData,
    pagination,
    loading,
    filters,
    page,
    setFilter,
    clearFilters,
    setPage,
    refresh,
  } = useTransactions(API_PATH.EXPENSE.GET_ALL_EXPENSE);

  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert]         = useState({ show: false, data: null });

  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;
    if (!category.trim()) { toast.error("Category is required"); return; }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount must be a positive number"); return;
    }
    if (!date) { toast.error("Date is required"); return; }

    try {
      await axiosInstance.post(API_PATH.EXPENSE.ADD_EXPENSE, {
        category, amount: Number(amount), date, icon,
      });
      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    }
  };

  const deleteExpense = async () => {
    try {
      await axiosInstance.delete(API_PATH.EXPENSE.DELETE_EXPENSE(openDeleteAlert.data));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense deleted successfully");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete expense");
    }
  };

  const handleDownload = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "" && v !== undefined) params.set(k, v);
      });
      const res = await axiosInstance.get(
        `${API_PATH.EXPENSE.DOWNLOAD_EXPENSE}?${params.toString()}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
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
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownload}
          />
        </div>

        <Modal isOpen={openAddExpenseModal} onClose={() => setOpenAddExpenseModal(false)} title="Add Expense">
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>
        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
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
