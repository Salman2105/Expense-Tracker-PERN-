export default function AuthLoadingScreen() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--background)" }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div
          className="h-12 w-12 rounded-full border-4 border-[var(--border)] border-t-[var(--primary)] animate-spin"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Checking your session
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Please wait while we verify your account.
          </p>
        </div>
      </div>
    </main>
  );
}
