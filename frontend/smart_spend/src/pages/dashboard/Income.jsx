import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/income/IncomeOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import AddIncomeForm from "../../components/income/AddIncomeForm";
import toast from "react-hot-toast";
import IncomeList from "../../components/income/IncomeList";
import DeleteAlert from "../../components/DeleteAlert";

const Income = () => {
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  //Get all income details
  const fetchIncomeDetails = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const responce = await axiosInstance.get(API_PATH.INCOME.GET_ALL_INCOME);
      setIncomeData(responce.data || []);
    } catch (err) {
      console.error("Something went wrong. Please try again", err);
      toast.error("Error downloading icome list");
    } finally {
      setLoading(false);
    }
  };

  //Handle Add Income

  const handleAddIncome = async (income) => {
    const { source, amount, date, icon } = income;

    //Validation Check
    if (!source.trim()) {
      toast.error("Source is required");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount should be a valid number greater then 0.");
      return;
    }
    if (!date) {
      toast.error("Date is required.");
      return;
    }

    try {
      await axiosInstance.post(API_PATH.INCOME.ADD_INCOME, {
        source,
        amount: Number(amount),
        date,
        icon,
      });
      setOpenAddIncomeModal(false);
      toast.success("Income added successfully");
      fetchIncomeDetails();
    } catch (err) {
      console.error(
        "Error adding income:",
        err.response?.data?.message || err.message
      );
    }
  };

  //Delete Income

  const deleteIncome = async (id) => {};

  //Handle download Income details

  const handleDownloadIncomeDetails = async () => {};

  useEffect(() => {
    fetchIncomeDetails();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className="gtid grid-cols-1 gap-6">
          <div className="">
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModal(true)}
            />
          </div>
          <IncomeList
            transactions={incomeData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadIncomeDetails}
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
          inOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Income"
        >
          <DeleteAlert
            content="Are you sure you want to delete this income details"
            onDelete={() => deleteIncome(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Income;
