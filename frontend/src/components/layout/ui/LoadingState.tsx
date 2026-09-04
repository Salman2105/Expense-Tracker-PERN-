
type LoadingStateProps = {
  message?: string;
};

function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <div
      className="flex min-h-40 items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]"
          aria-hidden="true"
        />

        <span className="text-sm text-[var(--text-secondary)]">
          {message}
        </span>
      </div>
    </div>
  );
}

export default LoadingState;
