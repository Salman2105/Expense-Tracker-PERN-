import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { normalizeApiError } from "../../../api/errors";
import { useAuth } from "../../../domain/auth/useAuth";

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, "Username is required.")
      .min(3, "Username must be at least 3 characters.")
      .max(50, "Username must be 50 characters or fewer.")
      .regex(
        /^[a-zA-Z0-9_.-]+$/,
        "Username can only contain letters, numbers, underscores, dots, and hyphens.",
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .max(254, "Email must be 254 characters or fewer.")
      .email("Please enter a valid email address."),
    password: z
      .string()
      .min(1, "Password is required.")
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    confirmPassword: z
      .string()
      .min(1, "Confirm password is required."),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    if (isSubmitting) {
      return;
    }

    setApiError(null);

    try {
      const { username, email, password } = values;
      await registerUser(username.trim(), email.trim().toLowerCase(), password);
      void navigate("/login");
    } catch (error) {
      const normalized = normalizeApiError(error);
      const message = normalized.message?.toLowerCase() ?? "";

      if (normalized.status === 400) {
        setApiError(
          normalized.message || "Please review your details and try again.",
        );
        return;
      }

      if (normalized.status === 409) {
        if (message.includes("email")) {
          setApiError("Email is already registered");
          return;
        }

        if (message.includes("username")) {
          setApiError("Username is already taken");
          return;
        }

        setApiError("This account information is already in use.");
        return;
      }

      setApiError("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="auth-form-panel" aria-labelledby="register-title">
      <div className="auth-form-heading">
          <p 
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            Expense Tracker
          </p>
          <h1 
            id="register-title" 
            className="mt-3 text-3xl sm:text-4xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Create account
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>
            Sign up to start tracking your finances.
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

          {/* Username Field */}
          <div className="space-y-2">
            <label 
              htmlFor="username" 
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              User Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? "username-error" : undefined}
              className="w-full px-4 py-2.5 rounded-md text-base transition-colors focus:outline-none"
              style={{
                background: "var(--surface)",
                border: errors.username ? "1.5px solid var(--expense)" : "1px solid var(--border)",
                color: "var(--text-primary)"
              }}
              {...register("username", {
                onChange: () => setApiError(null),
              })}
            />
            {errors.username && (
              <p id="username-error" className="text-sm" style={{ color: "var(--expense)" }}>
                {errors.username.message}
              </p>
            )}
          </div>

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
            <label 
              htmlFor="password" 
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
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

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                className="w-full px-4 py-2.5 rounded-md text-base transition-colors focus:outline-none"
                style={{
                  background: "var(--surface)",
                  border: errors.confirmPassword ? "1.5px solid var(--expense)" : "1px solid var(--border)",
                  color: "var(--text-primary)"
                }}
                {...register("confirmPassword", {
                  onChange: () => setApiError(null),
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: "var(--text-secondary)" }}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm" style={{ color: "var(--expense)" }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Sign Up Button */}
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
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
      </form>
    </section>
  );
}

export default RegisterPage;