import { Link } from "react-router-dom";

function NotFoundPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6"><section className="max-w-md text-center"><p className="text-sm font-semibold text-[var(--primary)]">404</p><h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Page not found</h1><p className="mt-3 text-sm text-[var(--text-secondary)]">The page you requested does not exist or is no longer available.</p><Link to="/dashboard" className="mt-6 inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">Back to Dashboard</Link></section></main>;
}

export default NotFoundPage;