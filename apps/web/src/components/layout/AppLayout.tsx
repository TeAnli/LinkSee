import { Outlet } from 'react-router-dom';
import { Sidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';
import { TopBar } from './TopBar';
import { RightPanel } from './RightPanel';
import { BottomNav } from './BottomNav';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSyncCSSVar } from '@/hooks/useSyncCSSVar';

export function AppLayout() {
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);

  // Sync sidebar width to CSS var so TopBar can use it purely in CSS
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  useSyncCSSVar('--sidebar-w', `${sidebarWidth}px`);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Left sidebar - desktop only */}
      <Sidebar />

      {/* Top bar */}
      <TopBar />

      {/* Main content area */}
      <main
        className="xl:mr-[280px] pt-[76px] pb-24 lg:pb-8 px-5 lg:px-8 min-h-screen"
        style={{
          marginLeft: 'var(--sidebar-w, 0px)',
          transition: 'margin-left 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Outlet />
      </main>

      {/* Right panel - desktop large only */}
      <RightPanel />

      {/* Bottom navigation - mobile */}
      <BottomNav />
    </div>
  );
}
