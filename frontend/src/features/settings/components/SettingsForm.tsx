import { useEffect, useState, type FormEvent } from "react";

import type { UpdateUserSettingsRequest } from "../../../domain/contracts/user-settings.contracts";
import { CURRENCIES, type CurrencyCode } from "../../../domain/enums/currency";
import { LANGUAGES, type LanguageCode } from "../../../domain/enums/language";
import type { Theme } from "../../../domain/enums/theme";
import type { UserSettings } from "../../../domain/models/user-settings";
import { useI18n } from "../../../i18n/i18n-context";
import { useTheme } from "../../../domain/theme/theme-context";

type SettingsFormProps = {
  settings: UserSettings;
  isSubmitting: boolean;
  onSubmit: (payload: UpdateUserSettingsRequest) => Promise<void>;
};

type FormValues = {
  theme: Theme;
  preferredCurrency: CurrencyCode;
  language: LanguageCode;
  emailNotifications: boolean;
  budgetAlerts: boolean;
};

const toFormValues = (settings: UserSettings): FormValues => ({
  theme: settings.theme,
  preferredCurrency: settings.preferredCurrency,
  language: settings.language,
  emailNotifications: settings.emailNotifications,
  budgetAlerts: settings.budgetAlerts,
});

function SettingsForm({ settings, isSubmitting, onSubmit }: SettingsFormProps) {
  const { setTheme } = useTheme();
  const { setLanguage, t } = useI18n();
  const [values, setValues] = useState(() => toFormValues(settings));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const serverValues = toFormValues(settings);
  const hasChanges = JSON.stringify(values) !== JSON.stringify(serverValues);

  useEffect(() => {
    queueMicrotask(() => setValues(toFormValues(settings)));
  }, [settings]);

  const setValue = <Key extends keyof FormValues>(key: Key, value: FormValues[Key]) => {
    setSaved(false);
    setError(null);
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !hasChanges) return;

    try {
      setError(null);
      await onSubmit(values);
      setSaved(true);
    } catch (caughtError) {
      setTheme(settings.theme);
      setLanguage(settings.language);
      setError(caughtError instanceof Error ? caughtError.message : t("settings.failed"));
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
      <section className="border-b border-[var(--border)] pb-5" aria-labelledby="appearance-title">
        <h2 id="appearance-title" className="text-lg font-semibold text-[var(--text-primary)]">{t("settings.appearance")}</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("settings.appearanceDescription")}</p>
        <fieldset className="mt-4 grid gap-3 sm:grid-cols-3">
          <legend className="sr-only">{t("settings.appearance")}</legend>
          {(["LIGHT", "DARK", "SYSTEM"] as const).map((theme) => (
            <label key={theme} className={values.theme === theme ? "cursor-pointer rounded-md border-2 border-[var(--primary)] bg-[var(--primary-light)] p-3 text-sm font-medium text-[var(--text-primary)]" : "cursor-pointer rounded-md border border-[var(--border)] p-3 text-sm font-medium text-[var(--text-primary)]"}>
              <input type="radio" name="theme" value={theme} checked={values.theme === theme} onChange={() => { setValue("theme", theme); setTheme(theme); }} className="sr-only" />
              {theme === "LIGHT" ? t("common.light") : theme === "DARK" ? t("common.dark") : t("common.system")}
            </label>
          ))}
        </fieldset>
      </section>

      <section className="border-b border-[var(--border)] py-5" aria-labelledby="preferences-title">
        <h2 id="preferences-title" className="text-lg font-semibold text-[var(--text-primary)]">{t("settings.preferences")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="preferred-currency">
            {t("settings.preferredCurrency")}
            <select id="preferred-currency" value={values.preferredCurrency} onChange={(event) => setValue("preferredCurrency", event.target.value as CurrencyCode)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 font-normal text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
              {CURRENCIES.map(({ code, name }) => <option key={code} value={code}>{name} ({code})</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="language">
            {t("settings.language")}
            <select id="language" value={values.language} onChange={(event) => { const language = event.target.value as LanguageCode; setValue("language", language); setLanguage(language); }} className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 font-normal text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
              {LANGUAGES.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="py-5" aria-labelledby="notifications-title">
        <h2 id="notifications-title" className="text-lg font-semibold text-[var(--text-primary)]">{t("settings.notifications")}</h2>
        <div className="mt-4 space-y-3">
          {(["emailNotifications", "budgetAlerts"] as const).map((key) => (
            <label key={key} className="flex items-center justify-between gap-4 text-sm font-medium text-[var(--text-primary)]">
              {t(`settings.${key}`)}
              <input type="checkbox" checked={values[key]} onChange={(event) => setValue(key, event.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="text-sm text-[var(--text-secondary)]">{error ?? (isSubmitting ? t("settings.saving") : saved ? t("settings.saved") : hasChanges ? t("settings.unsaved") : t("settings.noChanges"))}</p>
        <button type="submit" disabled={isSubmitting || !hasChanges} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? t("settings.saving") : t("settings.save")}</button>
      </div>
    </form>
  );
}

export default SettingsForm;
