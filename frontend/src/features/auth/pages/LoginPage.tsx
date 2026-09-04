import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { normalizeApiError } from "../../../api/errors";
import { useAuth } from "../../../domain/auth/useAuth";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(254, "Email must be 254 characters or fewer.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password must be 128 characters or fewer."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    if (isSubmitting) {
      return;
    }

    setApiError(null);

    try {
      await login(email.trim().toLowerCase(), password);
      void navigate("/dashboard");
    } catch (error) {
      const normalized = normalizeApiError(error);
      const message = normalized.message?.toLowerCase() ?? "";

      if (normalized.status === 400) {
        setApiError("Please check your email and password and try again.");
        return;
      }

      if (normalized.status === 401 || normalized.status === 403) {
        if (message.includes("deleted")) {
          setApiError("Account has been deleted");
          return;
        }

        if (message.includes("suspended")) {
          setApiError("Account is suspended");
          return;
        }

        setApiError("Invalid email or password");
        return;
      }

      setApiError("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="auth-form-panel" aria-labelledby="login-title">
      <div className="auth-form-heading">
          <p 
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            Expense Tracker
          </p>
          <h1 
            id="login-title" 
            className="mt-3 text-3xl sm:text-4xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>
            Sign in to manage your finances.
          </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* API Error */}
          {apiError && (
            <div 
              className="border rounded-md p-4"
              style={{ 
                background: "rgba(232, 93, 104, 0.1)",
                borderColor: "var(--expense)"
              }}
              role="alert" 
              aria-live="assertive"
            >
              <p className="text-sm" style={{ color: "var(--expense)" }}>
                {apiError}
              </p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="w-full px-4 py-2.5 rounded-md text-base transition-colors focus:outline-none"
              style={{
                background: "var(--surface)",
                border: errors.email ? "1.5px solid var(--expense)" : "1px solid var(--border)",
                color: "var(--text-primary)"
              }}
              {...register("email", {
                onChange: () => setApiError(null),
              })}
            />
            {errors.email && (
              <p id="email-error" className="text-sm" style={{ color: "var(--expense)" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Password
              </label>
              <Link
                to="#"
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--primary)" }}
                onClick={(e) => e.preventDefault()}
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="w-full px-4 py-2.5 rounded-md text-base transition-colors focus:outline-none"
                style={{
                  background: "var(--surface)",
                  border: errors.password ? "1.5px solid var(--expense)" : "1px solid var(--border)",
                  color: "var(--text-primary)"
                }}
                {...register("password", {
                  onChange: () => setApiError(null),
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: "var(--text-secondary)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm" style={{ color: "var(--expense)" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-md text-base font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: isSubmitting ? "var(--primary)" : "var(--primary)",
              opacity: isSubmitting ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = "var(--primary-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = "var(--primary)";
              }
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
      </form>
    </section>
  );
}

export default LoginPage;