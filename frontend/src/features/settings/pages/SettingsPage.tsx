import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { normalizeApiError } from "../../../api/errors";
import ErrorState from "../../../components/layout/ui/ErrorState";
import { useToast } from "../../../components/layout/ui/toast-context";
import { useI18n } from "../../../i18n/i18n-context";
import type { UpdateUserSettingsRequest } from "../../../domain/contracts/user-settings.contracts";
import SettingsForm from "../components/SettingsForm";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";

function SettingsSkeleton() {
  return <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5" aria-busy="true">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-md bg-[var(--surface-secondary)]" />)}</div>;
}

function SettingsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [success, setSuccess] = useState<string | null>(null);
  const settingsQuery = useSettings();
  const updateSettings = useUpdateSettings();
  const settings = settingsQuery.data?.data ?? null;
  const isLoading = settingsQuery.isLoading;
  const isSubmitting = updateSettings.isPending;
  const error = settingsQuery.error
    ? t("settings.loadingError")
    : null;
  const loadSettings = () => void settingsQuery.refetch();
  const saveSettings = async (payload: UpdateUserSettingsRequest) => { try { await updateSettings.mutateAsync(payload); setSuccess(t("settings.saved")); showToast(t("settings.saved"), "success"); } catch (caughtError) { normalizeApiError(caughtError); throw new Error(t("settings.failed"), { cause: caughtError }); } };
  return <main className="p-4 md:p-6"><div className="mx-auto max-w-3xl space-y-6"><header><p className="text-sm font-medium uppercase tracking-wide text-[var(--text-secondary)]">{t("settings.account")}</p><h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{t("settings.title")}</h1></header>{isLoading ? <SettingsSkeleton /> : error ? <ErrorState title={t("settings.unavailable")} message={error} onRetry={loadSettings} /> : settings && <>{success && <p className="rounded-md bg-[var(--primary-light)] p-3 text-sm font-medium text-[var(--primary)]">{success}</p>}<SettingsForm settings={settings} isSubmitting={isSubmitting} onSubmit={saveSettings} /><section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"><h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("settings.accountManagement")}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{t("settings.accountDescription")}</p><button type="button" onClick={() => navigate("/account")} className="mt-4 rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]">{t("settings.manageAccount")}</button></section></>}</div></main>;
}

export default SettingsPage;
