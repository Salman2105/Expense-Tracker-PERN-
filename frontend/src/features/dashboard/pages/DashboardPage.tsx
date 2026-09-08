import { useEffect, useRef } from "react";
import { normalizeApiError } from "../../../api/errors";
import CategorySpending from "../../../components/dashboard/CategorySpending";
import SummaryCards from "../../../components/dashboard/SummaryCards";
import TransactionStats from "../../../components/dashboard/TransactionStats";
import DashboardSkeleton from "../../../components/dashboard/DashboardSkeleton";
import DashboardInsights from "../../../components/dashboard/DashboardInsights";
import ErrorState from "../../../components/layout/ui/ErrorState";
import { useCategories } from "../../categories/hooks/useCategories";
import { useDashboard } from "../hooks/useDashboard";
import { useSettings } from "../../settings/hooks/useSettings";
import { useToast } from "../../../components/layout/ui/toast-context";

const DEFAULT_CURRENCY = "PKR";

function DashboardPage() {
  const dashboardQuery = useDashboard();
  const categoriesQuery = useCategories();
  const settingsQuery = useSettings();
  const { showToast } = useToast();
  const shownBudgetAlerts = useRef(new Set<string>());
  const isLoading =
    dashboardQuery.isLoading ||
    categoriesQuery.isLoading ||
    settingsQuery.isLoading;
  const queryError =
    dashboardQuery.error ?? categoriesQuery.error ?? settingsQuery.error;
  const dashboard = dashboardQuery.data?.data ?? null;
  const categories = Array.isArray(categoriesQuery.data?.data)
    ? categoriesQuery.data.data
    : [];
  const currency = settingsQuery.data?.data.preferredCurrency || DEFAULT_CURRENCY;

  useEffect(() => {
    for (const budget of dashboard?.budgetStatuses ?? []) {
      if (!budget.threshold) continue;
      const alertKey = `${budget.budgetId}:${budget.threshold}`;
      if (shownBudgetAlerts.current.has(alertKey)) continue;
      shownBudgetAlerts.current.add(alertKey);
      showToast(
        budget.threshold === 100
          ? `${budget.categoryName} budget exceeded: ${budget.percentage.toFixed(0)}% used.`
          : `${budget.categoryName} budget is at ${budget.percentage.toFixed(0)}% used.`,
        budget.threshold === 100 ? "error" : "warning",
      );
    }
  }, [dashboard?.budgetStatuses, showToast]);
  const loadDashboard = () =>
    void Promise.all([
      dashboardQuery.refetch(),
      categoriesQuery.refetch(),
      settingsQuery.refetch(),
    ]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (queryError) {
    return (
      <main className="p-4 md:p-6">
        <ErrorState
          title="Dashboard unavailable"
          message={
            normalizeApiError(queryError).message ||
            "We couldn't load your dashboard right now. Please try again."
          }
          onRetry={loadDashboard}
        />
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="p-4 md:p-6">
        <ErrorState
          title="Dashboard unavailable"
          message="We couldn't load your dashboard right now. Please try again."
          onRetry={loadDashboard}
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <SummaryCards
        totalIncome={dashboard.totalIncome}
        totalExpenses={dashboard.totalExpenses}
        currentBalance={dashboard.currentBalance}
        monthlySpending={dashboard.monthlySpending}
        currency={currency}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <CategorySpending
          categorySpending={dashboard.categorySpending}
          categories={categories}
          currency={currency}
        />

        <TransactionStats transactionStats={dashboard.transactionStats} />
      </div>

      <DashboardInsights dashboard={dashboard} categories={categories} currency={currency} />
    </main>
  );
}

export default DashboardPage;
