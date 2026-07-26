import { useState } from "react";
import toast from "react-hot-toast";
import type { Income as IncomeType } from "@shared/types";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/income/IncomeOverview";
import axiosInstance, { apiErrorMessage } from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import AddIncomeForm, {
  type IncomeFormValues,
} from "../../components/income/AddIncomeForm";
import IncomeList from "../../components/income/IncomeList";
import DeleteAlert from "../../components/DeleteAlert";
import useTransactions, { buildParams } from "../../hooks/useTransactions";
import downloadFile from "../../utils/download";

const Income = () => {
  const {
    data: incomeData,
    pagination,
    loading,
    filters,
    setFilter,
    clearFilters,
    setPage,
    refresh,
  } = useTransactions<IncomeType>(API_PATH.INCOME.GET_ALL_INCOME);

  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddIncome = async (income: IncomeFormValues) => {
    const { source, amount, date, icon } = income;
    if (!source.trim()) return toast.error("Source is required");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Amount must be a positive number");
    }
    if (!date) return toast.error("Date is required");

    try {
      await axiosInstance.post(API_PATH.INCOME.ADD_INCOME, {
        source,
        amount: Number(amount),
        date,
        icon,
      });
      setOpenAddIncomeModal(false);
      toast.success("Income added successfully");
      refresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to add income"));
    }
  };

  const deleteIncome = async () => {
    if (!deleteId) return;
    try {
      await axiosInstance.delete(API_PATH.INCOME.DELETE_INCOME(deleteId));
      setDeleteId(null);
      toast.success("Income deleted successfully");
      refresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete income"));
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile(
        `${API_PATH.INCOME.DOWNLOAD_INCOME}?${buildParams(filters)}`,
        "income_details.xlsx"
      );
    } catch {
      toast.error("Failed to download. Please try again.");
    }
  };

  return (
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <IncomeOverview
            transactions={incomeData}
            onAddIncome={() => setOpenAddIncomeModal(true)}
          />
          <IncomeList
            transactions={incomeData}
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
          isOpen={openAddIncomeModal}
          onClose={() => setOpenAddIncomeModal(false)}
          title="Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>

        <Modal
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          title="Delete Income"
        >
          <DeleteAlert
            content="Are you sure you want to delete this income?"
            onDelete={deleteIncome}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Income;
