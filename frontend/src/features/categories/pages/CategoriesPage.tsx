import { useState } from "react";

import { normalizeApiError } from "../../../api/errors";
import EmptyState from "../../../components/layout/ui/EmptyState";
import ErrorState from "../../../components/layout/ui/ErrorState";
import type { CreateCategoryRequest } from "../../../domain/contracts/category.contracts";
import type { Category } from "../../../domain/models/category";
import { formatCurrency } from "../../../lib/formatters";
import CategoryForm from "../components/CategoryForm";
import CategoryIcon from "../components/CategoryIcon";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useCategories";
import { useDashboard } from "../../dashboard/hooks/useDashboard";
import { useSettings } from "../../settings/hooks/useSettings";

function CategorySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface)]"
        />
      ))}
    </div>
  );
}

type CategoryGroupProps = {
  title: string;
  categories: Category[];
  spendingByCategory: Map<string, number>;
  currency: string;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

function CategoryGroup({
  title,
  categories,
  spendingByCategory,
  currency,
  onEdit,
  onDelete,
}: CategoryGroupProps) {
  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const amount = spendingByCategory.get(category.categoryId) ?? 0;
          const isEditable = !category.isDefault;

          return (
          <article key={category.categoryId} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <CategoryIcon icon={category.icon} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-[var(--text-primary)]">{category.name}</h3>
                <p className={category.type === "INCOME" ? "mt-1 text-xs font-medium text-[var(--income)]" : "mt-1 text-xs font-medium text-[var(--expense)]"}>{category.type === "INCOME" ? "Income" : "Expense"}</p>
              </div>
              {isEditable && <div className="flex shrink-0 gap-3"><button type="button" onClick={() => onEdit(category)} className="text-sm font-medium text-[var(--primary)]">Edit</button><button type="button" onClick={() => onDelete(category)} className="text-sm font-medium text-[var(--expense)]">Delete</button></div>}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-sm">
              <span className="text-[var(--text-secondary)]">{category.type === "EXPENSE" ? "Total spent" : "Category income"}</span>
              <span className={category.type === "EXPENSE" ? "font-semibold text-[var(--expense)]" : "font-semibold text-[var(--income)]"}>{formatCurrency(amount, currency)}</span>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}

function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null | undefined>(undefined);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const categoriesQuery = useCategories();
  const dashboardQuery = useDashboard();
  const settingsQuery = useSettings();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const categories = Array.isArray(categoriesQuery.data?.data)
    ? categoriesQuery.data.data
    : [];
  const isLoading = categoriesQuery.isLoading;
  const error = deleteError ?? (categoriesQuery.error
    ? normalizeApiError(categoriesQuery.error).message || "We couldn't load categories. Please try again."
    : null);
  const spendingByCategory = new Map(
    dashboardQuery.data?.data.categorySpending.map((item) => [item.categoryId, item.amount]) ?? [],
  );
  const currency = settingsQuery.data?.data.preferredCurrency || "PKR";
  const isSubmitting =
    createCategory.isPending || updateCategory.isPending || deleteCategoryMutation.isPending;
  const loadCategories = () => {
    setDeleteError(null);
    void Promise.all([
      categoriesQuery.refetch(),
      dashboardQuery.refetch(),
      settingsQuery.refetch(),
    ]);
  };

  const globalCategories = categories.filter((category) => category.isDefault);
  const userCategories = categories.filter((category) => !category.isDefault);
  const closeForm = () => setSelectedCategory(undefined);
  const saveCategory = async (payload: CreateCategoryRequest) => {
    try {
      if (selectedCategory) await updateCategory.mutateAsync({ id: selectedCategory.categoryId, payload });
      else await createCategory.mutateAsync(payload);
      closeForm();
    } catch (caughtError) {
      throw new Error(normalizeApiError(caughtError).message, { cause: caughtError });
    }
  };
  const deleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.categoryId);
      setCategoryToDelete(null);
    } catch (caughtError) {
      setDeleteError(normalizeApiError(caughtError).message || "We couldn't delete this category.");
    }
  };

  return (
    <main className="space-y-6 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium uppercase tracking-wide text-[var(--text-secondary)]">Organization</p><h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">Categories</h1></div>
        <button type="button" onClick={() => setSelectedCategory(null)} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">New category</button>
      </header>
      {isLoading ? <CategorySkeleton /> : error ? <ErrorState title="Categories unavailable" message={error} onRetry={loadCategories} /> : categories.length === 0 ? <EmptyState title="No categories available." message="Create a category to organize your transactions." action={<button type="button" onClick={() => setSelectedCategory(null)} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">New category</button>} /> : <div className="space-y-6"><CategoryGroup title="Default categories" categories={globalCategories} spendingByCategory={spendingByCategory} currency={currency} onEdit={setSelectedCategory} onDelete={setCategoryToDelete} /><CategoryGroup title="Your categories" categories={userCategories} spendingByCategory={spendingByCategory} currency={currency} onEdit={setSelectedCategory} onDelete={setCategoryToDelete} /></div>}
      {selectedCategory !== undefined && <CategoryForm category={selectedCategory} isSubmitting={isSubmitting} onClose={closeForm} onSubmit={saveCategory} />}
      {categoryToDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-category-title"><div className="w-full max-w-sm rounded-lg bg-[var(--surface)] p-5"><h2 id="delete-category-title" className="text-lg font-semibold">Delete category?</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">Transactions in &quot;{categoryToDelete.name}&quot; will be moved to Uncategorized.</p><div className="mt-5 flex justify-end gap-3"><button type="button" disabled={isSubmitting} onClick={() => setCategoryToDelete(null)} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm">Cancel</button><button type="button" disabled={isSubmitting} onClick={() => void deleteCategory()} className="rounded-md bg-[var(--expense)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Deleting..." : "Delete"}</button></div></div></div>}
    </main>
  );
}

export default CategoriesPage;
