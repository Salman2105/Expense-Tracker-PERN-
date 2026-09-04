import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./app/routes/AppRoutes";
import { AuthProvider } from "./domain/auth/AuthProvider";
import { ToastProvider } from "./components/layout/ui/ToastProvider";
import { QueryProvider } from "./app/QueryProvider";
import { ThemeProvider } from "./domain/theme/ThemeProvider";
import "./index.css";
import { I18nProvider } from "./i18n/I18nProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <I18nProvider>
            <ThemeProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ThemeProvider>
          </I18nProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  </StrictMode>,
);