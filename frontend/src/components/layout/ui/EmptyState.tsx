
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  message?: string;
  action?: ReactNode;
};

function EmptyState({
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      {message && (
        <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
          {message}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;

