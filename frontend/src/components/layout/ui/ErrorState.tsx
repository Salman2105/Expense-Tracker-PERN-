
type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this information. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--background)]"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            background: "var(--surface)",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;

