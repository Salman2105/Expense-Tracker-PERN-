type DeleteAccountDialogProps = {
  isDeleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteAccountDialog({ isDeleting, error, onCancel, onConfirm }: DeleteAccountDialogProps) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-account-title"><div className="w-full max-w-md rounded-lg bg-[var(--surface)] p-5"><h2 id="delete-account-title" className="text-lg font-semibold text-[var(--text-primary)]">Delete your account?</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">Your account will be removed from the application according to the account deletion policy. You will be signed out immediately.</p>{error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-[var(--expense)]">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} disabled={isDeleting} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium">Cancel</button><button type="button" onClick={onConfirm} disabled={isDeleting} className="rounded-md bg-[var(--expense)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isDeleting ? "Deleting account..." : "Delete account"}</button></div></div></div>;
}

export default DeleteAccountDialog;