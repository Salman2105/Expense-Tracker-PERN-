import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronUp, CircleDollarSign, FolderKanban, LayoutDashboard, LogOut, ReceiptText, Settings, UserRound } from "lucide-react";
import { useAuth } from "../../domain/auth/useAuth";
import { useI18n } from "../../i18n/i18n-context";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const navigationItems = [
  {
    key: "dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "transactions",
    path: "/transactions",
    icon: ReceiptText,
  },
  {
    key: "categories",
    path: "/categories",
    icon: FolderKanban,
  },
  {
    key: "settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { t } = useI18n();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

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
    <>
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col overflow-hidden bg-[var(--sidebar)] shadow-xl transition-transform duration-200",
          "md:sticky md:top-0 md:min-h-0 md:self-start md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <h1 className="flex items-center gap-2 text-xl font-bold text-white">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ background: "var(--primary)" }}
            >
              <CircleDollarSign size={18} aria-hidden="true" />
            </span>
            Spendex
          </h1>
        </div>

        {/* Navigation */}

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4" aria-label="Main navigation">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-3",
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--primary)] text-[var(--sidebar-active-text)]"
                      : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-white",
                  ].join(" ")
                }
              >
                <item.icon size={18} strokeWidth={2} aria-hidden="true" />
                {t(`common.${item.key}` as "common.dashboard" | "common.transactions" | "common.categories" | "common.settings")}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom section */}

        <div className="relative shrink-0 border-t border-white/10 p-3">
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 z-50 mb-2 rounded-lg border border-white/10 bg-[var(--sidebar-hover)] py-1 shadow-xl" role="menu">
              <button type="button" onClick={() => { setIsUserMenuOpen(false); onClose?.(); navigate("/profile"); }} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar)] hover:text-white" role="menuitem">
                <UserRound size={16} aria-hidden="true" />
                {t("common.profile")}
              </button>
              <button type="button" onClick={() => { setIsUserMenuOpen(false); onClose?.(); navigate("/settings"); }} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar)] hover:text-white" role="menuitem">
                <Settings size={16} aria-hidden="true" />
                {t("common.settings")}
              </button>
              <div className="my-1 border-t border-white/10" />
              <button type="button" onClick={() => void handleLogout()} disabled={isLoggingOut} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60" role="menuitem">
                <LogOut size={16} aria-hidden="true" />
                {isLoggingOut ? t("common.loggingOut") : t("common.logout")}
              </button>
            </div>
          )}

          <button type="button" onClick={() => setIsUserMenuOpen((previous) => !previous)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-white" aria-expanded={isUserMenuOpen} aria-haspopup="menu">
            {user?.profilePicture ? <img src={user.profilePicture} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">{user?.username.slice(0, 1).toUpperCase() ?? "?"}</span>}
            <span className="min-w-0 flex-1 truncate">{user?.username ?? t("settings.account")}</span>
            <ChevronUp size={16} className={`shrink-0 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;