import { useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { Category } from "../../domain/models/category";
import type { CategorySpending, Dashboard } from "../../domain/models/dashboard";
import { formatCurrency } from "../../lib/formatters";

type DashboardInsightsProps = { dashboard: Dashboard; categories: Category[]; currency: string };

const chartColors = ["var(--chart-green)", "var(--chart-blue)", "var(--chart-yellow)", "var(--chart-orange)", "var(--chart-purple)", "var(--expense)"];

function DashboardInsights({ dashboard, categories, currency }: DashboardInsightsProps) {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const categoryNames = new Map(categories.map((category) => [category.categoryId, category.name]));
  const categoryData = dashboard.categorySpending.filter((item: CategorySpending) => Number.isFinite(item.amount) && item.amount > 0).map((item) => ({ name: categoryNames.get(item.categoryId) ?? "Uncategorized", amount: item.amount }));
  const totalCategorySpending = categoryData.reduce((total, category) => total + category.amount, 0);
  const selectedCategory = categoryData[selectedCategoryIndex] ?? categoryData[0];
  const selectedCategoryPercentage = selectedCategory && totalCategorySpending > 0 ? (selectedCategory.amount / totalCategorySpending) * 100 : 0;
  const expenseShare = dashboard.totalIncome > 0 ? Math.min((dashboard.totalExpenses / dashboard.totalIncome) * 100, 100) : 0;
  const availableIncome = Math.max(dashboard.totalIncome - dashboard.totalExpenses, 0);
  const incomeUsageData = [{ name: "Expenses", amount: Math.min(dashboard.totalExpenses, dashboard.totalIncome), fill: "var(--expense)" }, { name: "Available income", amount: availableIncome, fill: "var(--income)" }];
  const currencyTooltip = (value: unknown) => formatCurrency(Number(value ?? 0), currency);
  const tooltipStyle = { backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" };

  return (
  <section>
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Expense Distribution */}
      <article className="h-80 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Expense distribution
        </h3>

        {categoryData.length === 0 ? (
          <p className="mt-16 text-center text-sm text-[var(--text-secondary)]">
            No category spending data yet.
          </p>
        ) : (
          <div className="relative h-[88%]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              className="outline-none focus:outline-none"
            >
              <PieChart
                className="outline-none focus:outline-none"
                tabIndex={-1}
              >
                <Pie
                  data={categoryData}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius="52%"
                  outerRadius="76%"
                  paddingAngle={3}
                  animationDuration={700}
                  rootTabIndex={-1}
                  onClick={(_, index) => {
                    setSelectedCategoryIndex(index);

                    // Remove browser focus ring after clicking the chart
                    requestAnimationFrame(() => {
                      const activeElement = document.activeElement;

                      if (activeElement instanceof HTMLElement) {
                        activeElement.blur();
                      } else if (activeElement instanceof SVGElement) {
                        activeElement.blur();
                      }
                    });
                  }}
                >
                  {categoryData.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={chartColors[index % chartColors.length]}
                      className="cursor-pointer outline-none focus:outline-none"
                      opacity={
                        index === selectedCategoryIndex ? 1 : 0.7
                      }
                      stroke="transparent"
                      strokeWidth={0}
                      strokeLinecap="round"
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={currencyTooltip}
                  contentStyle={tooltipStyle}
                />

                <Legend
                  verticalAlign="bottom"
                  height={30}
                  wrapperStyle={{
                    color: "var(--text-secondary)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center information */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7 text-center">
              <span className="max-w-24 truncate text-xs font-medium text-[var(--text-primary)]">
                {selectedCategory?.name}
              </span>

              <span className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {selectedCategoryPercentage.toFixed(0)}%
              </span>

              <span className="text-xs text-[var(--text-secondary)]">
                {selectedCategory &&
                  formatCurrency(selectedCategory.amount, currency)}
              </span>
            </div>
          </div>
        )}
      </article>

      {/* Income Usage */}
      <article className="h-80 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Income usage
          </h3>

          <span className="rounded-full bg-[var(--primary-light)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
            {expenseShare.toFixed(0)}% used
          </span>
        </div>

        {dashboard.totalIncome <= 0 ? (
          <p className="mt-16 text-center text-sm text-[var(--text-secondary)]">
            Add income to view your expense usage.
          </p>
        ) : (
          <div className="grid h-[88%] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 sm:gap-5">
            {/* Income Usage Chart */}
            <div className="relative h-48 min-w-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
                className="outline-none focus:outline-none"
              >
                <PieChart
                  className="outline-none focus:outline-none"
                  tabIndex={-1}
                >
                  <Pie
                    data={incomeUsageData}
                    dataKey="amount"
                    innerRadius="55%"
                    outerRadius="78%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                    animationDuration={900}
                    rootTabIndex={-1}
                  >
                    {incomeUsageData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.fill}
                        stroke="transparent"
                        strokeWidth={0}
                        className="outline-none focus:outline-none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-[var(--text-secondary)]">
                  Used
                </span>

                <span className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                  {expenseShare.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Income Details */}
            <dl className="min-w-0 space-y-4 text-sm">
              <div>
                <dt className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--expense)]" />
                  Expenses
                </dt>

                <dd className="mt-1 truncate font-semibold text-[var(--expense)]">
                  {formatCurrency(
                    dashboard.totalExpenses,
                    currency
                  )}
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--income)]" />
                  Available
                </dt>

                <dd className="mt-1 truncate font-semibold text-[var(--income)]">
                  {formatCurrency(availableIncome, currency)}
                </dd>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <dt className="text-[var(--text-secondary)]">
                  Total income
                </dt>

                <dd className="mt-1 truncate font-semibold text-[var(--text-primary)]">
                  {formatCurrency(
                    dashboard.totalIncome,
                    currency
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </article>
    </div>
  </section>
);
}

export default DashboardInsights;