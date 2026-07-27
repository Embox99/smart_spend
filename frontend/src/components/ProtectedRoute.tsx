import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { clearSession, hasLiveSession } from "../utils/token";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  if (!hasLiveSession()) {
    // Drop the stale marker so the login page starts from a clean state.
    clearSession();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
