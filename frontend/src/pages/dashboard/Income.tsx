import { useState } from "react";
import toast from "react-hot-toast";
import type { Income as IncomeType } from "@shared/types";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/income/IncomeOverview";
import axiosInstance, { apiErrorMessage } from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import IncomeForm from "../../components/income/IncomeForm";
import {
  toIncomeFormValues,
  type IncomeFormValues,
} from "../../utils/transactionForm";
import IncomeList from "../../components/income/IncomeList";
import DeleteAlert from "../../components/DeleteAlert";
import useTransactions, { buildParams } from "../../hooks/useTransactions";
import { useInvalidateFinancials } from "../../hooks/useInvalidateFinancials";
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
  } = useTransactions<IncomeType>(API_PATH.INCOME.GET_ALL_INCOME);

  const invalidate = useInvalidateFinancials();
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<IncomeType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const closeForm = () => {
    setIsCreating(false);
    setEditing(null);
  };

  const handleSubmit = async (values: IncomeFormValues) => {
    const { source, amount, date, icon } = values;
    if (!source.trim()) return toast.error("Source is required");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Amount must be a positive number");
    }
    if (!date) return toast.error("Date is required");

    const payload = { source, amount: Number(amount), date, icon };

    try {
      if (editing) {
        await axiosInstance.put(
          API_PATH.INCOME.UPDATE_INCOME(editing._id),
          payload
        );
      } else {
        await axiosInstance.post(API_PATH.INCOME.ADD_INCOME, payload);
      }
      toast.success(editing ? "Income updated" : "Income added successfully");
      closeForm();
      invalidate("income");
    } catch (err) {
      toast.error(
        apiErrorMessage(err, `Failed to ${editing ? "update" : "add"} income`)
      );
    }
  };

  const deleteIncome = async () => {
    if (!deleteId) return;
    try {
      await axiosInstance.delete(API_PATH.INCOME.DELETE_INCOME(deleteId));
      setDeleteId(null);
      toast.success("Income deleted successfully");
      invalidate("income");
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
            onAddIncome={() => setIsCreating(true)}
          />
          <IncomeList
            transactions={incomeData}
            pagination={pagination}
            loading={loading}
            filters={filters}
            onFilterChange={setFilter}
            onFilterClear={clearFilters}
            onPageChange={setPage}
            onEdit={(id) =>
              setEditing(incomeData.find((i) => i._id === id) ?? null)
            }
            onDelete={setDeleteId}
            onDownload={handleDownload}
          />
        </div>

        <Modal
          isOpen={isCreating || editing !== null}
          onClose={closeForm}
          title={editing ? "Edit Income" : "Add Income"}
        >
          {/* Keyed so switching records remounts the form with fresh state. */}
          <IncomeForm
            key={editing?._id ?? "new"}
            onSubmit={handleSubmit}
            initialValues={editing ? toIncomeFormValues(editing) : undefined}
            submitLabel={editing ? "Save Changes" : "Add Income"}
          />
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
