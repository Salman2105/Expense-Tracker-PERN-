import { useState } from "react";

import { normalizeApiError } from "../../../api/errors";
import EmptyState from "../../../components/layout/ui/EmptyState";
import ErrorState from "../../../components/layout/ui/ErrorState";
import type { Transaction } from "../../../domain/models/transaction";
import type { CreateTransactionRequest, TransactionListQuery } from "../../../domain/contracts/transaction.contracts";
import TransactionFilters, { type TransactionFiltersState } from "../components/TransactionFilters";
import TransactionForm from "../components/TransactionForm";
import TransactionList, { TransactionListSkeleton } from "../components/TransactionList";
import { useCategories } from "../../categories/hooks/useCategories";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "../hooks/useTransactions";

const DEFAULT_FILTERS: TransactionFiltersState = { type: "", categoryId: "", startDate: "", endDate: "" };
const PAGE_SIZE = 10;

function TransactionsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const query: TransactionListQuery = { page, limit: PAGE_SIZE, ...(filters.type && { type: filters.type }), ...(filters.categoryId && { categoryId: filters.categoryId }), ...(filters.startDate && { startDate: `${filters.startDate}T00:00:00.000Z` }), ...(filters.endDate && { endDate: `${filters.endDate}T23:59:59.999Z` }) };
  const transactionsQuery = useTransactions(query);
  const categoriesQuery = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const transactions = transactionsQuery.data?.data.transactions ?? [];
  const categories = Array.isArray(categoriesQuery.data?.data) ? categoriesQuery.data.data : [];
  const totalPages = transactionsQuery.data?.data.pagination.totalPages ?? 1;
  const total = transactionsQuery.data?.data.pagination.total ?? 0;
  const isLoading = transactionsQuery.isFetching;
  const error = mutationError ?? (transactionsQuery.error ? normalizeApiError(transactionsQuery.error).message || "We couldn't load transactions. Please try again." : null);
  const isSubmitting = createTransaction.isPending || updateTransaction.isPending || deleteTransaction.isPending;
  const loadTransactions = () => {
    setMutationError(null);
    void transactionsQuery.refetch();
  };
  const updateFilters = (nextFilters: TransactionFiltersState) => { setFilters(nextFilters); setPage(1); };
  const closeForm = () => setSelectedTransaction(undefined);
  const saveTransaction = async (payload: CreateTransactionRequest) => { try { if (selectedTransaction) await updateTransaction.mutateAsync({ id: selectedTransaction.transactionId, payload }); else await createTransaction.mutateAsync(payload); closeForm(); } catch (caughtError) { throw new Error(normalizeApiError(caughtError).message, { cause: caughtError }); } };
  const confirmDelete = async () => { if (!transactionToDelete) return; try { await deleteTransaction.mutateAsync(transactionToDelete.transactionId); setTransactionToDelete(null); if (transactions.length === 1 && page > 1) setPage((current) => current - 1); } catch (caughtError) { setMutationError(normalizeApiError(caughtError).message || "We couldn't delete this transaction."); } };
  const hasFilters = Object.values(filters).some(Boolean);

  return <main className="space-y-6 p-4 md:p-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">Transactions</h1></div><button type="button" onClick={() => setSelectedTransaction(null)} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">New transaction</button></header><TransactionFilters filters={filters} categories={categories} onChange={updateFilters} onClear={() => updateFilters(DEFAULT_FILTERS)} />{error ? <ErrorState title="Transactions unavailable" message={error} onRetry={loadTransactions} /> : isLoading ? <TransactionListSkeleton /> : transactions.length === 0 ? <EmptyState title={hasFilters ? "No transactions match these filters." : "No transactions yet."} message={hasFilters ? "Try clearing or adjusting your filters." : "Create your first income or expense transaction."} action={<button type="button" onClick={hasFilters ? () => updateFilters(DEFAULT_FILTERS) : () => setSelectedTransaction(null)} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">{hasFilters ? "Clear filters" : "New transaction"}</button>} /> : <><TransactionList transactions={transactions} categories={categories} onEdit={setSelectedTransaction} onDelete={setTransactionToDelete} /><div className="flex items-center justify-between gap-4"><p className="text-sm text-[var(--text-secondary)]">{total} transaction{total === 1 ? "" : "s"}</p><div className="flex items-center gap-3"><button type="button" disabled={page === 1 || isLoading} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-50">Previous</button><span className="text-sm text-[var(--text-secondary)]">Page {page} of {totalPages}</span><button type="button" disabled={page === totalPages || isLoading} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-50">Next</button></div></div></>}{selectedTransaction !== undefined && <TransactionForm categories={categories} transaction={selectedTransaction} isSubmitting={isSubmitting} onClose={closeForm} onSubmit={saveTransaction} />}{transactionToDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-transaction-title"><div className="w-full max-w-sm rounded-lg bg-[var(--surface)] p-5"><h2 id="delete-transaction-title" className="text-lg font-semibold">Delete transaction?</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">This will permanently delete &quot;{transactionToDelete.title}&quot;.</p><div className="mt-5 flex justify-end gap-3"><button type="button" disabled={isSubmitting} onClick={() => setTransactionToDelete(null)} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm">Cancel</button><button type="button" disabled={isSubmitting} onClick={() => void confirmDelete()} className="rounded-md bg-[var(--expense)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Deleting..." : "Delete"}</button></div></div></div>}</main>;
}

export default TransactionsPage;
