import { useState } from "react";

import type { Category } from "../../../domain/models/category";
import type { CreateTransactionRequest } from "../../../domain/contracts/transaction.contracts";
import type { TransactionType } from "../../../domain/enums/transaction-type";
import type { Transaction } from "../../../domain/models/transaction";
import ResponsiveSelect from "../../../components/ui/ResponsiveSelect";

type TransactionFormProps = {
  categories: Category[];
  transaction: Transaction | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTransactionRequest) => Promise<void>;
};
type FormValues = {
  categoryId: string;
  type: TransactionType;
  amount: string;
  title: string;
  note: string;
  transactionDate: string;
};

const initialValues = (transaction: Transaction | null): FormValues => ({
  categoryId: transaction?.categoryId ?? "",
  type: transaction?.type ?? "EXPENSE",
  amount: transaction?.amount ?? "",
  title: transaction?.title ?? "",
  note: transaction?.note ?? "",
  transactionDate:
    transaction?.transactionDate.slice(0, 10) ??
    new Date().toISOString().slice(0, 10),
});

function TransactionForm({
  categories,
  transaction,
  isSubmitting,
  onClose,
  onSubmit,
}: TransactionFormProps) {
  const [values, setValues] = useState(() => initialValues(transaction));
  const [error, setError] = useState<string | null>(null);
  const matchingCategories = categories.filter(
    (category) => category.type === values.type,
  );
  const setValue = <Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key],
  ) => setValues((current) => ({ ...current, [key]: value }));
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.title.trim()) return setError("Title is required.");
    if (!values.categoryId) return setError("Select a category.");
    if (!Number.isFinite(Number(values.amount)) || Number(values.amount) <= 0)
      return setError("Amount must be a positive number.");
    if ((values.amount.split(".")[1] ?? "").length > 2)
      return setError("Amount can have at most two decimal places.");
    if (!values.transactionDate)
      return setError("Transaction date is required.");
    setError(null);
    try {
      await onSubmit({
        categoryId: values.categoryId,
        type: values.type,
        amount: Number(values.amount),
        title: values.title.trim(),
        note: values.note.trim() || null,
        transactionDate: `${values.transactionDate}T00:00:00.000Z`,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We couldn't save this transaction. Please try again.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-form-title"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-full w-full max-w-full overflow-y-auto overflow-x-hidden rounded-t-lg bg-[var(--surface)] p-5 box-border sm:max-w-lg sm:rounded-lg"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="transaction-form-title" className="text-lg font-semibold">
            {transaction ? "Edit transaction" : "New transaction"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--text-secondary)]"
          >
            Close
          </button>
        </div>
        {error && (
          <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-[var(--expense)]">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0 text-sm font-medium">
            <span className="block">Type</span>
            <div className="mt-1 min-w-0 w-full max-w-full box-border">
              <ResponsiveSelect
                label="Transaction type"
                value={values.type}
                options={[
                  { value: "EXPENSE", label: "Expense" },
                  { value: "INCOME", label: "Income" },
                ]}
                onChange={(type) => {
                  const nextType = type as TransactionType;
                  setValues((current) => ({
                    ...current,
                    type: nextType,
                    categoryId: categories.some(
                      (category) =>
                        category.categoryId === current.categoryId &&
                        category.type === nextType,
                    )
                      ? current.categoryId
                      : "",
                  }));
                }}
                className="w-full"
              />
            </div>
          </label>
          <label className="block min-w-0 text-sm font-medium">
            <span className="block">Category</span>
            <div className="mt-1 min-w-0 w-full max-w-full box-border">
              <ResponsiveSelect
                label="Category"
                value={values.categoryId}
                placeholder="Select a category"
                options={matchingCategories.map((category) => ({
                  value: category.categoryId,
                  label: category.name,
                }))}
                onChange={(categoryId) => setValue("categoryId", categoryId)}
                className="w-full"
              />
            </div>
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Title
            <input
              value={values.title}
              onChange={(event) => setValue("title", event.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 font-normal"
            />
          </label>
          <label className="text-sm font-medium">
            Amount
            <input
              type="number"
              min="0"
              step="10"
              value={values.amount}
              onChange={(event) => setValue("amount", event.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 font-normal"
            />
          </label>
          <label className="text-sm font-medium">
            Date
            <input
              type="date"
              value={values.transactionDate}
              onChange={(event) =>
                setValue("transactionDate", event.target.value)
              }
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 font-normal"
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Note
            <textarea
              value={values.note}
              onChange={(event) => setValue("note", event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 font-normal"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting
              ? "Saving..."
              : transaction
                ? "Save changes"
                : "Create transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
