import { Link } from "react-router-dom";

function AccessDeniedPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6"><section className="max-w-md text-center"><p className="text-sm font-semibold text-[var(--expense)]">403</p><h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Access denied</h1><p className="mt-3 text-sm text-[var(--text-secondary)]">You do not have permission to access this resource.</p><Link to="/dashboard" className="mt-6 inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">Back to Dashboard</Link></section></main>;
}

export default AccessDeniedPage;