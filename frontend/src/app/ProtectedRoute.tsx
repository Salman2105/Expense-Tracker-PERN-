import { Navigate, Outlet } from "react-router-dom";
import AuthLoadingScreen from "./AuthLoadingScreen";
import { useAuth } from "../domain/auth/useAuth";

export default function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "INITIALIZING") {
    return <AuthLoadingScreen />;
  }

  if (status === "UNAUTHENTICATED") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
