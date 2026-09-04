import { Link } from "react-router-dom";
import { ArrowRight, CircleDollarSign, TrendingDown, TrendingUp } from "lucide-react";
import Reveal from "./Reveal";

function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8"
      style={{ background: "var(--background)" }}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p
            className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
            style={{ background: "var(--primary-light)", color: "var(--primary-hover)" }}
          >
            Personal Finance, Simplified
          </p>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            Track your money.
            <br />
            Understand your spending.
            <br />
            <span style={{ color: "var(--primary)" }}>Save with confidence.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base text-[var(--text-secondary)] sm:text-lg">
            Spendex helps you record income and expenses, organize spending
            into categories, and see exactly where your money goes — all in one
            clean dashboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors"
              style={{ background: "var(--primary)" }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "var(--primary-hover)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "var(--primary)";
              }}
            >
              Get Started
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-6 py-3 text-base font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)]"
            >
              Sign In
            </Link>
          </div>
        </Reveal>

        <Reveal delay={150} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="animate-[landing-float_6s_ease-in-out_infinite] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl motion-reduce:animate-none">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Current Balance</p>
              {/* <Wallet size={18} style={{ color: "var(--primary)" }} aria-hidden="true" /> */}
                <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
            style={{ background: "var(--primary)" }}
          >
            <CircleDollarSign size={18} aria-hidden="true" />
          </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">PKR 62,430</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} style={{ color: "var(--income)" }} aria-hidden="true" />
                  <p className="text-xs font-medium text-[var(--text-secondary)]">Income</p>
                </div>
                <p className="mt-1 text-lg font-semibold" style={{ color: "var(--income)" }}>
                  PKR 145,000
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown size={16} style={{ color: "var(--expense)" }} aria-hidden="true" />
                  <p className="text-xs font-medium text-[var(--text-secondary)]">Expenses</p>
                </div>
                <p className="mt-1 text-lg font-semibold" style={{ color: "var(--expense)" }}>
                  PKR 82,570
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Bills</span>
                <span>38%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--surface-secondary)" }}>
                <div className="h-2 rounded-full" style={{ width: "38%", background: "var(--chart-blue)" }} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default HeroSection;
