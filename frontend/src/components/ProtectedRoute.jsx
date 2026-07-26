import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid, clearToken } from "../utils/token";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isTokenValid()) {
    // Drop the expired token so the login page starts from a clean state.
    clearToken();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
