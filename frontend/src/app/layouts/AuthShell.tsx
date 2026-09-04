import { Link, Outlet, useLocation } from "react-router-dom";

import "./auth-shell.css";

function AuthShell() {
  const { pathname } = useLocation();
  const isRegister = pathname === "/register";

  return (
    <main className={`auth-page ${isRegister ? "auth-page-register" : "auth-page-login"}`}>
      <section className="auth-card" aria-label="Expense Tracker authentication">
        <div className="auth-form-slot">
          <Outlet />
        </div>

        <aside className="auth-promo" aria-live="polite">
          <div className="auth-promo-shape auth-promo-shape-one" />
          <div className="auth-promo-shape auth-promo-shape-two" />
          <div className="auth-promo-content">
            <p className="auth-promo-kicker">Expense Tracker</p>
            <h2>{isRegister ? "Already have an account?" : "New here?"}</h2>
            <p>
              {isRegister
                ? "Welcome back. Continue managing your finances with clarity."
                : "Start tracking your money and take control of your spending."}
            </p>
            <Link className="auth-promo-action" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create account"}
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default AuthShell;