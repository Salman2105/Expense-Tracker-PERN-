import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import AuthShell from "../layouts/AuthShell";
import AuthLoadingScreen from "../AuthLoadingScreen";
import ProtectedRoute from "../ProtectedRoute";
import { useAuth } from "../../domain/auth/useAuth";

import LandingPage from "../../features/landing/pages/LandingPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import TransactionsPage from "../../features/transactions/pages/TransactionsPage";
import CategoriesPage from "../../features/categories/pages/CategoriesPage";
import ProfilePage from "../../features/profile/pages/ProfilePage";
import SettingsPage from "../../features/settings/pages/SettingsPage";
import AccountPage from "../../features/account/pages/AccountPage";
import AccessDeniedPage from "../../components/layout/ui/AccessDeniedPage";
import NotFoundPage from "../../components/layout/ui/NotFoundPage";

function PublicAuthRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === "INITIALIZING") {
    return <AuthLoadingScreen />;
  }

  if (status === "AUTHENTICATED") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicAuthRoute>
            <LandingPage />
          </PublicAuthRoute>
        }
      />
      <Route element={<PublicAuthRoute><AuthShell /></PublicAuthRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<AuthShell />}>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route
        path="/forbidden"
        element={<AccessDeniedPage />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
