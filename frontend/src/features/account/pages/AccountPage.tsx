import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { normalizeApiError } from "../../../api/errors";
import ErrorState from "../../../components/layout/ui/ErrorState";
import { useAuth } from "../../../domain/auth/useAuth";
import DeleteAccountDialog from "../components/DeleteAccountDialog";
import { useAccountStatus, useDeleteAccount } from "../hooks/useAccount";

function AccountSkeleton() {
  return <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5" aria-busy="true">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-md bg-[var(--surface-secondary)]" />)}</div>;
}

function AccountPage() {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const accountQuery = useAccountStatus();
  const deleteAccountMutation = useDeleteAccount();
  const accountStatus = accountQuery.data?.data ?? null;
  const isLoading = accountQuery.isLoading;
  const error = accountQuery.error ? normalizeApiError(accountQuery.error).message || "We couldn't load your account information." : null;
  const isDeleting = deleteAccountMutation.isPending;
  const loadAccount = () => void accountQuery.refetch();
  const deleteAccount = async () => { if (isDeleting) return; setDeleteError(null); try { await deleteAccountMutation.mutateAsync(); clearSession(); navigate("/login", { replace: true }); } catch (caughtError) { setDeleteError(normalizeApiError(caughtError).message || "We couldn't delete your account. Please try again."); } };
  const status = accountStatus?.status ?? user?.status;
  return <main className="p-4 md:p-6"><div className="mx-auto max-w-3xl space-y-6"><header><p className="text-sm font-medium uppercase tracking-wide text-[var(--text-secondary)]">Account</p><h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">Account management</h1></header>{isLoading ? <AccountSkeleton /> : error ? <ErrorState title="Account unavailable" message={error} onRetry={loadAccount} /> : user && <><section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"><h2 className="text-lg font-semibold text-[var(--text-primary)]">Account information</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-medium uppercase text-[var(--text-secondary)]">Username</dt><dd className="mt-1 text-sm text-[var(--text-primary)]">{user.username}</dd></div><div><dt className="text-xs font-medium uppercase text-[var(--text-secondary)]">Email</dt><dd className="mt-1 break-words text-sm text-[var(--text-primary)]">{user.email}</dd></div><div><dt className="text-xs font-medium uppercase text-[var(--text-secondary)]">Account status</dt><dd className={status === "ACTIVE" ? "mt-1 text-sm font-medium text-[var(--income)]" : "mt-1 text-sm font-medium text-[var(--expense)]"}>{status === "ACTIVE" ? "Active" : "Suspended"}</dd></div><div><dt className="text-xs font-medium uppercase text-[var(--text-secondary)]">Member since</dt><dd className="mt-1 text-sm text-[var(--text-primary)]">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(user.createdAt))}</dd></div></dl></section><section className="rounded-lg border border-red-200 bg-[var(--surface)] p-5 shadow-sm"><h2 className="text-lg font-semibold text-[var(--expense)]">Danger zone</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Permanently remove your Expense Tracker account and associated account data.</p><button type="button" onClick={() => { setDeleteError(null); setIsDialogOpen(true); }} className="mt-4 rounded-md bg-[var(--expense)] px-4 py-2 text-sm font-semibold text-white">Delete account</button></section>{isDialogOpen && <DeleteAccountDialog isDeleting={isDeleting} error={deleteError} onCancel={() => setIsDialogOpen(false)} onConfirm={() => void deleteAccount()} />}</>}</div></main>;
}

export default AccountPage;
