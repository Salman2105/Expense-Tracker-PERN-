import { useState } from "react";
import { Link } from "react-router-dom";
import { CircleDollarSign, Menu, Moon, Sun, X } from "lucide-react";

import { useTheme } from "../../domain/theme/theme-context";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
  { label: "Coming Updates", href: "#updates" },
];

function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleTheme = () => {
    setTheme(isDark ? "LIGHT" : "DARK");
  };

  const themeToggleButton = (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-md border border-[var(--border)] p-2 text-[var(--text-primary)] transition-colors hover:bg-[var(--background)]"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border)]"
      style={{
        background: "color-mix(in srgb, var(--surface) 92%, transparent)",
        backdropFilter: "blur(8px)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            handleNavClick("#home");
          }}
          className="flex items-center gap-2 font-bold text-[var(--text-primary)]"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
            style={{ background: "var(--primary)" }}
          >
            <CircleDollarSign size={18} aria-hidden="true" />
          </span>
          <span className="text-lg">Spendex</span>
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {themeToggleButton}
          <Link
            to="/login"
            className="rounded-md px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--background)]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ background: "var(--primary)" }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "var(--primary-hover)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "var(--primary)";
            }}
          >
            Get Started
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {themeToggleButton}
          <button
            type="button"
            onClick={() => setIsMenuOpen((previous) => !previous)}
            className="rounded-md border border-[var(--border)] p-2 text-[var(--text-primary)]"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="landing-mobile-menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          id="landing-mobile-menu"
          className="border-t border-[var(--border)] px-4 pb-6 pt-2 lg:hidden"
          style={{ background: "var(--surface)" }}
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--background)] hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md border border-[var(--border)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--text-primary)]"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-4 py-2.5 text-center text-sm font-semibold text-white"
              style={{ background: "var(--primary)" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default LandingNavbar;
