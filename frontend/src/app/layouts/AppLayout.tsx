import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/layout/Sidebar";

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  return (
    <div className="h-dvh overflow-hidden bg-[var(--background)]">
      {isMobile && !isSidebarOpen && (
        <button
          type="button"
          className="fixed right-4 top-4 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[var(--sidebar)] text-white shadow-lg transition-colors hover:bg-[var(--sidebar-hover)] md:hidden"
          aria-label="Open navigation menu"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      )}

      <div className="flex h-full">
        <Sidebar isOpen={isMobile ? isSidebarOpen : true} onClose={() => setIsSidebarOpen(false)} />

        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;