import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { normalizeApiError } from "../../../api/errors";
import ErrorState from "../../../components/layout/ui/ErrorState";
import { useToast } from "../../../components/layout/ui/toast-context";
import { useI18n } from "../../../i18n/i18n-context";
import type { UpdateUserSettingsRequest } from "../../../domain/contracts/user-settings.contracts";
import SettingsForm from "../components/SettingsForm";
import SettingsVisual from "../components/SettingsVisual";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";

function SettingsSkeleton() {
  return <div className="settings-skeleton" aria-busy="true">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-lg bg-[var(--surface-secondary)]" />)}</div>;
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
  return <main className="settings-page"><div className="settings-shell"><div className="settings-content"><header className="settings-header"><h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{t("settings.title")}</h1></header>{isLoading ? <SettingsSkeleton /> : error ? <ErrorState title={t("settings.unavailable")} message={error} onRetry={loadSettings} /> : settings && <>{success && <p className="settings-success" role="status">{success}</p>}<SettingsForm settings={settings} isSubmitting={isSubmitting} onSubmit={saveSettings} /><section className="settings-account-card"><div><span className="settings-account-card__eyebrow">{t("settings.accountManagement")}</span><h2>{t("settings.accountManagement")}</h2><p>{t("settings.accountDescription")}</p></div><button type="button" onClick={() => navigate("/account")} className="settings-secondary-button">{t("settings.manageAccount")}<ArrowUpRight size={16} aria-hidden="true" /></button></section></>}</div><SettingsVisual /></div></main>;
}

export default SettingsPage;
