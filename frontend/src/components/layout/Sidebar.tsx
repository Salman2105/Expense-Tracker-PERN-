import { NavLink } from "react-router-dom";
import { CircleDollarSign, FolderKanban, LayoutDashboard, ReceiptText, Settings } from "lucide-react";
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
  const { t } = useI18n();
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed inset-y-16 left-0 z-50 flex h-[calc(100dvh-4rem)] w-64 flex-col overflow-hidden bg-[var(--sidebar)] shadow-xl transition-transform duration-200",
          "md:static md:min-h-[calc(100vh-4rem)] md:translate-x-0",
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

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xl text-white md:hidden"
              aria-label="Close navigation menu"
            >
              ×
            </button>
          )}
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

        <div className="shrink-0 border-t border-white/10 p-3">
          <p className="px-3 py-2 text-xs text-[var(--sidebar-text)]">
            PERN STACK PROJECT 
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;