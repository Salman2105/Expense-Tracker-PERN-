import SummaryCard from "./SummaryCard";
import { formatCurrency } from "../../lib/formatters";

type SummaryCardsProps = {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthlySpending: number;
  currency: string;
};

function SummaryCards({
  totalIncome,
  totalExpenses,
  currentBalance,
  monthlySpending,
  currency,
}: SummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Income"
        value={formatCurrency(totalIncome, currency)}
        tone="income"
      />
      <SummaryCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses, currency)}
        tone="expense"
      />
      <SummaryCard
        title="Current Balance"
        value={formatCurrency(currentBalance, currency)}
        tone={currentBalance >= 0 ? "income" : "expense"}
      />
      <SummaryCard
        title="Monthly Spending"
        value={formatCurrency(monthlySpending, currency)}
        tone="warning"
      />
    </section>
  );
}

export default SummaryCards;
