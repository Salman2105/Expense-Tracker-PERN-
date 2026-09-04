import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleDollarSign } from "lucide-react";

import { useAuth } from "../../domain/auth/useAuth";
import { useI18n } from "../../i18n/i18n-context";

type NavbarProps = {
  onMenuClick?: () => void;
};

function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();

  const { logout, user } = useAuth();
  const { t } = useI18n();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleProfile = () => {
    setIsUserMenuOpen(false);
    navigate("/profile");
  };

  const handleSettings = () => {
    setIsUserMenuOpen(false);
    navigate("/settings");
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setIsUserMenuOpen(false);

    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text-primary)] transition-colors hover:bg-[var(--background)] md:hidden"
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)] sm:text-lg">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md text-white"
            style={{ background: "var(--primary)" }}
          >
            <CircleDollarSign size={16} aria-hidden="true" />
          </span>
          Spendex
        </h2>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsUserMenuOpen((previous) => !previous)}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--background)]"
          style={{
            color: "var(--text-primary)",
          }}
          aria-expanded={isUserMenuOpen}
          aria-haspopup="menu"
        >
          {user?.profilePicture ? <img src={user.profilePicture} alt="" className="h-6 w-6 rounded-full object-cover" /> : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-xs font-bold text-[var(--primary)]">{user?.username.slice(0, 1).toUpperCase() ?? "?"}</span>}
          <span>{t("settings.account")}</span>

          <span
            aria-hidden="true"
            className={`transition-transform ${
              isUserMenuOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {isUserMenuOpen && (
          <div
            className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
            role="menu"
          >
            <button
              type="button"
              onClick={handleProfile}
              className="block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--background)]"
              style={{
                color: "var(--text-primary)",
              }}
              role="menuitem"
            >
              {t("common.profile")}
            </button>

            <button
              type="button"
              onClick={handleSettings}
              className="block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--background)]"
              style={{
                color: "var(--text-primary)",
              }}
              role="menuitem"
            >
              {t("common.settings")}
            </button>

            <div
              className="my-1 border-t"
              style={{
                borderColor: "var(--border)",
              }}
            />

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                color: "var(--text-primary)",
              }}
              role="menuitem"
            >
              {isLoggingOut ? t("common.loggingOut") : t("common.logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;

