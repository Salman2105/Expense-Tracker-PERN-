import { Outlet } from "react-router-dom";

import Sidebar from "../../components/layout/Sidebar";

function AppLayout() {
  return (
    <div className="h-dvh overflow-hidden bg-[var(--background)]">
      <div className="flex h-full">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;