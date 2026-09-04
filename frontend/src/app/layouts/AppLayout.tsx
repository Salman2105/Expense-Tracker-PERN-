import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar onMenuClick={handleOpenSidebar} />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;