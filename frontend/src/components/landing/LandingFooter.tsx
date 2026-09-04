import { Link } from "react-router-dom";
import { CircleDollarSign } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)] px-4 py-12 sm:px-6 lg:px-8" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ background: "var(--primary)" }}
              >
                <CircleDollarSign size={16} aria-hidden="true" />
              </span>
              <span>Spendex</span>
            </div>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              A simple personal finance tool to track, organize, and understand your spending.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <a href="#features" className="hover:text-[var(--text-primary)]">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[var(--text-primary)]">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[var(--text-primary)]">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[var(--text-primary)]">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link to="/login" className="hover:text-[var(--text-primary)]">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[var(--text-primary)]">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Legal</h3>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              &copy; {CURRENT_YEAR} Spendex. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
