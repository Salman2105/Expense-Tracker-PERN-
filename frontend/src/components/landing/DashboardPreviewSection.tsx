import { ArrowDownRight, ArrowUpRight, Receipt, Wallet } from "lucide-react";
import Reveal from "./Reveal";

const SUMMARY = [
  { label: "Total Income", value: "PKR 145,000", tone: "income" as const },
  { label: "Total Expenses", value: "PKR 82,570", tone: "expense" as const },
  { label: "Current Balance", value: "PKR 62,430", tone: "neutral" as const },
  { label: "Monthly Spending", value: "PKR 24,180", tone: "warning" as const },
];

const CATEGORIES = [
  { name: "Bills", percent: 38, color: "var(--chart-blue)" },
  { name: "Food", percent: 24, color: "var(--chart-green)" },
  { name: "Transport", percent: 16, color: "var(--chart-yellow)" },
  { name: "Shopping", percent: 12, color: "var(--chart-purple)" },
  { name: "Other", percent: 10, color: "var(--chart-orange)" },
];

const TONE_COLOR: Record<(typeof SUMMARY)[number]["tone"], string> = {
  income: "var(--income)",
  expense: "var(--expense)",
  neutral: "var(--text-primary)",
  warning: "var(--warning)",
};

function DashboardPreviewSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            A dashboard built for clarity
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)]">
            Sample preview shown with demo data — your real dashboard uses your own transactions.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-lg sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SUMMARY.map((item) => (
                <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: TONE_COLOR[item.tone] }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-center gap-2">
                  <Wallet size={16} style={{ color: "var(--primary)" }} aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Category Spending</h3>
                </div>
                <div className="mt-4 max-h-48 space-y-3 overflow-y-auto pr-1">
                  {CATEGORIES.map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                        <span>{category.name}</span>
                        <span>{category.percent}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full" style={{ background: "var(--surface-secondary)" }}>
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${category.percent}%`, background: category.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-center gap-2">
                  <Receipt size={16} style={{ color: "var(--primary)" }} aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Transaction Statistics</h3>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Total Transactions</span>
                    <span className="font-semibold text-[var(--text-primary)]">128</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Income</span>
                    <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--income)" }}>
                      <ArrowUpRight size={14} aria-hidden="true" /> 34
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Expenses</span>
                    <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--expense)" }}>
                      <ArrowDownRight size={14} aria-hidden="true" /> 94
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default DashboardPreviewSection;
