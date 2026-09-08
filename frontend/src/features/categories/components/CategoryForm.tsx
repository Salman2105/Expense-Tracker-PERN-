import { useState } from "react";

import type { CreateCategoryRequest } from "../../../domain/contracts/category.contracts";
import type { CategoryType } from "../../../domain/enums/category-type";
import type { Category } from "../../../domain/models/category";
import CategoryIcon from "./CategoryIcon";
import { categoryIconOptions } from "./category-icon-options";

type CategoryFormProps = {
  category: Category | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCategoryRequest) => Promise<void>;
};

function CategoryForm({ category, isSubmitting, onClose, onSubmit }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "food");
  const [type, setType] = useState<CategoryType>(category?.type ?? "EXPENSE");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setError(null);
      await onSubmit({ name: name.trim(), icon, type });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "We couldn't save this category.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
      <form onSubmit={handleSubmit} className="w-full rounded-t-lg bg-[var(--surface)] p-5 sm:max-w-md sm:rounded-lg">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="category-form-title" className="text-lg font-semibold text-[var(--text-primary)]">{category ? "Edit category" : "New category"}</h2>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="text-sm text-[var(--text-secondary)]">Close</button>
        </div>
        {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-[var(--expense)]">{error}</p>}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[var(--text-primary)]">Name
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] p-2 font-normal" />
          </label>
          <label className="block text-sm font-medium text-[var(--text-primary)]">Icon
            <div className="mt-1 flex items-center gap-3">
              <CategoryIcon icon={icon} />
              <select value={icon} onChange={(event) => setIcon(event.target.value)} className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 font-normal">
                {category && !categoryIconOptions.includes(category.icon) && <option value={category.icon}>{category.icon}</option>}
                {categoryIconOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </label>
          <label className="block text-sm font-medium text-[var(--text-primary)] ">Type
            <select value={type} onChange={(event) => setType(event.target.value as CategoryType)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 font-normal">
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Saving..." : category ? "Save changes" : "Create category"}</button>
        </div>
      </form>
    </div>
  );
}

export default CategoryForm;