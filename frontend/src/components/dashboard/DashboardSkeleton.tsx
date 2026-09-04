function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6" aria-busy="true" aria-live="polite">
      <div className="h-8 w-44 animate-pulse rounded-md bg-[var(--border)]" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-80 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
        <div className="h-80 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
      </div>
    </div>
  );
}

export default DashboardSkeleton;
