import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Forbidden from "../../pages/Forbidden";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/auth?mode=login" />;
  }

  return children;
}

export function RoleProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/auth?mode=login" />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Forbidden />;
  }

  return children;
}
