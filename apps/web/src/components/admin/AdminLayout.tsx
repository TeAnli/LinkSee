import { Outlet } from 'react-router-dom';
import { AdminSidebar, ADMIN_SIDEBAR_WIDTH, ADMIN_SIDEBAR_COLLAPSED_WIDTH, ADMIN_TOPBAR_HEIGHT } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { useAdminStore } from '@/stores/useAdminStore';

export function AdminLayout() {
  const sidebarCollapsed = useAdminStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAdminStore((s) => s.toggleSidebar);
  const sidebarWidth = sidebarCollapsed ? ADMIN_SIDEBAR_COLLAPSED_WIDTH : ADMIN_SIDEBAR_WIDTH;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <AdminTopBar sidebarCollapsed={sidebarCollapsed} />

      <main
        className="min-h-screen pb-8 px-6"
        style={{
          paddingTop: `${ADMIN_TOPBAR_HEIGHT + 24}px`,
          marginLeft: `${sidebarWidth}px`,
          transition: 'margin-left 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
