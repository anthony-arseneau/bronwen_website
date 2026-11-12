import { Navigate, Outlet } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';

// Wraps the /edit/* pages. The server still checks every save, so this only keeps the editor UI
// away from visitors who aren't logged in.
function ProtectedRoute() {
  const { isAuthenticated, authChecked } = useContent();

  if (!authChecked) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/edit" replace />;
}

export default ProtectedRoute;
