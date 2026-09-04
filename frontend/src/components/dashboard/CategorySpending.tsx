import type { Category } from "../../domain/models/category";
import type { CategorySpending as CategorySpendingItemModel } from "../../domain/models/dashboard";
import EmptyState from "../layout/ui/EmptyState";
import { formatCurrency } from "../../lib/formatters";
import CategoryIcon from "../../features/categories/components/CategoryIcon";

type CategorySpendingProps = {
  categorySpending: CategorySpendingItemModel[];
  categories: Category[];
  currency: string;
};

function CategorySpending({
  categorySpending,
  categories,
  currency,
}: CategorySpendingProps) {
  const categoryMap = new Map(
    categories
      .filter((category) => category.categoryId)
      .map((category) => [category.categoryId, category]),
  );

  const items = (Array.isArray(categorySpending) ? categorySpending : [])
    .map((item) => {
      const category = categoryMap.get(item.categoryId);

      return {
        categoryId: item.categoryId,
        name: category?.name ?? item.categoryId,
        icon: category?.icon ?? null,
        amount: item.amount,
      };
    })
    .filter((item) => Number.isFinite(item.amount));

  if (items.length === 0) {
    return (
      <section className="flex h-[22rem] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Category Spending
          </h3>
        </div>

        <EmptyState
          title="No category spending data yet."
          message="Your expense categories will appear here once you add transactions."
        />
      </section>
    );
  }

  return (
    <section className="flex h-[22rem] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Category Spending
        </h3>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" aria-label="Category spending list" tabIndex={0}>
        {items.map((item) => (
          <div
            key={item.categoryId}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <CategoryIcon icon={item.icon ?? ""} />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {item.name}
                </p>
              </div>
            </div>

            <span className="ml-3 shrink-0 text-sm font-semibold text-[var(--expense)]">
              {formatCurrency(item.amount, currency)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategorySpending;
