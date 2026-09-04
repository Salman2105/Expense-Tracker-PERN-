import type { Category } from "../../../domain/models/category";
import type { TransactionType } from "../../../domain/enums/transaction-type";

export type TransactionFiltersState = {
  type: TransactionType | "";
  categoryId: string;
  startDate: string;
  endDate: string;
};

type TransactionFiltersProps = {
  filters: TransactionFiltersState;
  categories: Category[];
  onChange: (filters: TransactionFiltersState) => void;
  onClear: () => void;
};

function TransactionFilters({ filters, categories, onChange, onClear }: TransactionFiltersProps) {
  const setFilter = <Key extends keyof TransactionFiltersState>(key: Key, value: TransactionFiltersState[Key]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2 xl:grid-cols-5">
      <select aria-label="Transaction type" value={filters.type} onChange={(event) => setFilter("type", event.target.value as TransactionType | "")} className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]">
        <option value="">All types</option>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>
      <select aria-label="Category" value={filters.categoryId} onChange={(event) => setFilter("categoryId", event.target.value)} className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]">
        <option value="">All categories</option>
        {categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.name}</option>)}
      </select>
      <input aria-label="Start date" type="date" value={filters.startDate} onChange={(event) => setFilter("startDate", event.target.value)} className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]" />
      <input aria-label="End date" type="date" value={filters.endDate} min={filters.startDate || undefined} onChange={(event) => setFilter("endDate", event.target.value)} className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]" />
      <button type="button" onClick={onClear} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]">Clear filters</button>
    </section>
  );
}

export default TransactionFilters;