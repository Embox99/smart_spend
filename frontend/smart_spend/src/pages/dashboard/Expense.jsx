import { React, useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATH } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { ExpenseOverview } from "../../components/expense/ExpenseOverview";
import AddExpenseForm from "../../components/expense/AddExpenseForm";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

const Expense = () => {
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [ExpenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  //Get all expense details
  const fetchExpenseDetails = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const responce = await axiosInstance.get(
        API_PATH.EXPENSE.GET_ALL_EXPENSE
      );
      setExpenseData(responce.data || []);
    } catch (err) {
      console.error("Something went wrong. Please try again", err);
      toast.error("Error downloading icome list");
    } finally {
      setLoading(false);
    }
  };

  //Handle Add Expense

  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    //Validation Check
    if (!category.trim()) {
      toast.error("Category is required");
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
      await axiosInstance.post(API_PATH.EXPENSE.ADD_EXPENSE, {
        category,
        amount: Number(amount),
        date,
        icon,
      });
      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      fetchExpenseDetails();
    } catch (err) {
      console.error(
        "Error adding expense:",
        err.response?.data?.message || err.message
      );
    }
  };

  useEffect(() => {
    fetchExpenseDetails();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <ExpenseOverview
              transactions={ExpenseData}
              onExpenseIncome={() => setOpenAddExpenseModal(true)}
            />
          </div>
        </div>
        <Modal
          isOpen={openAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
