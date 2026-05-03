import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { RightPanel } from './RightPanel';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Left sidebar - desktop only */}
      <Sidebar />

      {/* Top bar */}
      <TopBar />

      {/* Main content area */}
      <main
        className="lg:ml-64 xl:mr-[280px] pt-[76px] pb-24 lg:pb-8 px-5 lg:px-8 min-h-screen transition-all"
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
