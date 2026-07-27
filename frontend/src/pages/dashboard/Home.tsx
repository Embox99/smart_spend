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
import { useCurrency } from "../../hooks/useCurrency";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import FinanceOverview from "../../components/dashboard/FinanceOverview";
import ExpenseTransaction from "../../components/dashboard/ExpenseTransaction";
import Last30DaysExpenses from "../../components/dashboard/Last30DaysExpenses";
import RecentIncomeWithChart from "../../components/dashboard/RecentIncomeWithChart";
import RecentIncome from "../../components/dashboard/RecentIncome";

const Home = () => {
  const navigate = useNavigate();
  const { formatCompact } = useCurrency();

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
  const expensesByCategory = data?.last30DaysExpenses?.byCategory ?? [];
  const incomeBySource = data?.last60DaysIncome?.bySource ?? [];

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={formatCompact(totalBalance)}
            color="bg-primary"
          />
          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={formatCompact(totalIncome)}
            color="bg-orange-500"
          />
          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expense"
            value={formatCompact(totalExpense)}
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
            transactions={data?.recentExpenses}
            onSeeMore={() => navigate("/expense")}
          />
          <Last30DaysExpenses data={expensesByCategory} />
          <RecentIncomeWithChart
            data={incomeBySource}
            totalIncome={totalIncome}
          />
          <RecentIncome
            transactions={data?.recentIncome}
            onSeeMore={() => navigate("/income")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
