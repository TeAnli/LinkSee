import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (process.env.NODE_ENV !== 'development') {
    if (!isAuthenticated || !user?.roles?.some((r) => ADMIN_ROLES.has(r))) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
