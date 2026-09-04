import { Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout.tsx';
import { useAuth } from './AuthContext.tsx';

export function ProtectedRoute() {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
