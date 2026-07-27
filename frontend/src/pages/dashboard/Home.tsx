import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LuHandCoins, LuWalletMinimal } from "react-icons/lu";
import { IoMdCard } from "react-icons/io";
import type { DashboardData } from "@shared/types";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPaths";
import { queryKeys } from "../../utils/queryKeys";
import InfoCard from "../../components/cards/InfoCard";
import { addThousandsSeparator } from "../../utils/helper";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import FinanceOverview from "../../components/dashboard/FinanceOverview";
import ExpenseTransaction from "../../components/dashboard/ExpenseTransaction";
import Last30DaysExpenses from "../../components/dashboard/Last30DaysExpenses";
import RecentIncomeWithChart from "../../components/dashboard/RecentIncomeWithChart";
import RecentIncome from "../../components/dashboard/RecentIncome";

const Home = () => {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const res = await axiosInstance.get<DashboardData>(
        API_PATH.DASHBOARD.GET_DATA
      );
      return res.data;
    },
  });

  const totalBalance = data?.totalBalance ?? 0;
  const totalIncome = data?.totalIncome ?? 0;
  const totalExpense = data?.totalExpense ?? 0;
  const last30DaysExpenses = data?.last30DaysExpenses?.transactions ?? [];
  const last60DaysIncome = data?.last60DaysIncome?.transactions ?? [];

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandsSeparator(totalBalance)}
            color="bg-primary"
          />
          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(totalIncome)}
            color="bg-orange-500"
          />
          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expense"
            value={addThousandsSeparator(totalExpense)}
            color="bg-red-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions
            transactions={data?.recentTransactions}
            onSeeMore={() => navigate("/expense")}
          />
          <FinanceOverview
            totalBalance={totalBalance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />
          <ExpenseTransaction
            transactions={last30DaysExpenses}
            onSeeMore={() => navigate("/expense")}
          />
          <Last30DaysExpenses data={last30DaysExpenses} />
          <RecentIncomeWithChart
            data={last60DaysIncome.slice(0, 4)}
            totalIncome={totalIncome}
          />
          <RecentIncome
            transactions={last60DaysIncome}
            onSeeMore={() => navigate("/income")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
