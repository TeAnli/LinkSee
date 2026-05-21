import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

const ADMIN_ROLES = ['admin', 'super_admin'];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated || !user?.roles?.some((r) => ADMIN_ROLES.includes(r))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
