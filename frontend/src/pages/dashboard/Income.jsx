import { useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/income/IncomeOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import AddIncomeForm from "../../components/income/AddIncomeForm";
import toast from "react-hot-toast";
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
  } = useTransactions(API_PATH.INCOME.GET_ALL_INCOME);

  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert]       = useState({ show: false, data: null });

  const handleAddIncome = async (income) => {
    const { source, amount, date, icon } = income;
    if (!source.trim()) { toast.error("Source is required"); return; }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount must be a positive number"); return;
    }
    if (!date) { toast.error("Date is required"); return; }

    try {
      await axiosInstance.post(API_PATH.INCOME.ADD_INCOME, {
        source, amount: Number(amount), date, icon,
      });
      setOpenAddIncomeModal(false);
      toast.success("Income added successfully");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add income");
    }
  };

  const deleteIncome = async () => {
    try {
      await axiosInstance.delete(API_PATH.INCOME.DELETE_INCOME(openDeleteAlert.data));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Income deleted successfully");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete income");
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
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownload}
          />
        </div>

        <Modal isOpen={openAddIncomeModal} onClose={() => setOpenAddIncomeModal(false)} title="Add Income">
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>
        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
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
