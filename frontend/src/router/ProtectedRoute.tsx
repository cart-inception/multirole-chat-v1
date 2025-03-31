import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

/**
 * A wrapper component that redirects to login if user is not authenticated
 */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

/**
 * A wrapper component that redirects to chat if user is already authenticated
 */
export const AuthRoute = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Redirect to chat if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;