import type { TransactionStats as TransactionStatsModel } from "../../domain/models/dashboard";

type TransactionStatsProps = {
  transactionStats: TransactionStatsModel;
};

function TransactionStatsItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function TransactionStats({ transactionStats }: TransactionStatsProps) {
  return (
    <section className="flex h-auto min-h-[22rem] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:h-[22rem]">
      <h3 className="mb-5 text-lg font-semibold text-[var(--text-primary)]">
        Transaction Statistics
      </h3>

      <div className="grid flex-1 content-start gap-1 sm:grid-cols-3">
        <TransactionStatsItem
          label="Total Transactions"
          value={transactionStats.totalTransactions}
        />
        <TransactionStatsItem
          label="Income Transactions"
          value={transactionStats.incomeTransactions}
        />
        <TransactionStatsItem
          label="Expense Transactions"
          value={transactionStats.expenseTransactions}
        />
        <TransactionStatsItem
          label="Transactions This Month"
          value={transactionStats.totalTransactions}
        />
      </div>
    </section>
  );
}

export default TransactionStats;
