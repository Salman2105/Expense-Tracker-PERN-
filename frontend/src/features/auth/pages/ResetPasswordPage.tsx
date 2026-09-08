import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { normalizeApiError } from "../../../api/errors";
import { authService } from "../../../services/auth.service";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters.").max(128, "Password must be 128 characters or fewer."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [complete, setComplete] = useState(false);
  const [invalidToken, setInvalidToken] = useState(!token);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ password }: ResetPasswordValues) => {
    setApiError(null);
    try {
      await authService.resetPassword({ token, password });
      setComplete(true);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.status === 400 || normalized.message.toLowerCase().includes("expired")) {
        setInvalidToken(true);
        return;
      }
      setApiError("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="auth-form-panel" aria-labelledby="reset-password-title">
      <div className="auth-form-heading">
        <p>Expense Tracker</p>
        <h1 id="reset-password-title">Reset your password</h1>
        <p>Create a new password for your account.</p>
      </div>
      {complete ? (
        <div className="space-y-5" role="status" aria-live="polite">
          <p style={{ color: "var(--primary)" }}>Password reset successfully.</p>
          <Link className="auth-promo-action" style={{ color: "var(--primary)", borderColor: "var(--primary)" }} to="/login">Go to login</Link>
        </div>
      ) : invalidToken ? (
        <div className="space-y-5" role="alert">
          <p style={{ color: "var(--expense)" }}>This password reset link is invalid or has expired.</p>
          <Link className="block text-sm font-medium" style={{ color: "var(--primary)" }} to="/forgot-password">Request a new reset link</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {apiError && <p role="alert" className="text-sm" style={{ color: "var(--expense)" }}>{apiError}</p>}
          <div className="space-y-2">
            <label htmlFor="new-password" className="block text-sm font-medium">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" className="w-full px-4 py-2.5 rounded-md text-base" aria-invalid={Boolean(errors.password)} {...register("password")} />
            {errors.password && <p className="text-sm" style={{ color: "var(--expense)" }}>{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" className="w-full px-4 py-2.5 rounded-md text-base" aria-invalid={Boolean(errors.confirmPassword)} {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-sm" style={{ color: "var(--expense)" }}>{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 px-4 rounded-md text-base font-semibold text-white disabled:opacity-60" style={{ background: "var(--primary)" }}>
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
          <Link to="/login" className="block text-center text-sm font-medium" style={{ color: "var(--primary)" }}>Back to login</Link>
        </form>
      )}
    </section>
  );
}

export default ResetPasswordPage;