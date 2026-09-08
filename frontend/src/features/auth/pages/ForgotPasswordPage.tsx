import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { normalizeApiError } from "../../../api/errors";
import { authService } from "../../../services/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").max(254).email("Please enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: ForgotPasswordValues) => {
    setApiError(null);
    try {
      await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setSubmitted(true);
    } catch (error) {
      setApiError(normalizeApiError(error).status === 429
        ? "Too many requests. Please try again later."
        : "Something went wrong. Please try again.");
    }
  };

  return (
    <section className="auth-form-panel" aria-labelledby="forgot-password-title">
      <div className="auth-form-heading">
        <p>Expense Tracker</p>
        <h1 id="forgot-password-title">Forgot your password?</h1>
        <p>Enter your email and we&apos;ll send a secure reset link if an account exists.</p>
      </div>
      {submitted ? (
        <div className="space-y-5" role="status" aria-live="polite">
          <p className="border rounded-md p-4 text-sm" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>
            If an account exists with this email, we&apos;ve sent a password reset link.
          </p>
          <Link className="auth-promo-action" style={{ color: "var(--primary)", borderColor: "var(--primary)" }} to="/login">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {apiError && <p role="alert" className="text-sm" style={{ color: "var(--expense)" }}>{apiError}</p>}
          <div className="space-y-2">
            <label htmlFor="forgot-email" className="block text-sm font-medium">Email address</label>
            <input id="forgot-email" type="email" autoComplete="email" className="w-full px-4 py-2.5 rounded-md text-base" aria-invalid={Boolean(errors.email)} {...register("email")} />
            {errors.email && <p className="text-sm" style={{ color: "var(--expense)" }}>{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 px-4 rounded-md text-base font-semibold text-white disabled:opacity-60" style={{ background: "var(--primary)" }}>
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
          <Link to="/login" className="block text-center text-sm font-medium" style={{ color: "var(--primary)" }}>Back to login</Link>
        </form>
      )}
    </section>
  );
}

export default ForgotPasswordPage;