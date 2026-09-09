import { useEffect, useState, type FormEvent } from "react";

import ResponsiveSelect from "../../../components/ui/ResponsiveSelect";
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
    <form onSubmit={submit} className="settings-form">
      <section className="settings-form__section settings-form__section--first" aria-labelledby="appearance-title">
        <h2 id="appearance-title" className="settings-section-title">{t("settings.appearance")}</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("settings.appearanceDescription")}</p>
        <fieldset className="settings-theme-grid">
          <legend className="sr-only">{t("settings.appearance")}</legend>
          {(["LIGHT", "DARK", "SYSTEM"] as const).map((theme) => (
            <label key={theme} className={values.theme === theme ? "settings-theme-option settings-theme-option--active" : "settings-theme-option"}>
              <input type="radio" name="theme" value={theme} checked={values.theme === theme} onChange={() => { setValue("theme", theme); setTheme(theme); }} className="sr-only" />
              {theme === "LIGHT" ? t("common.light") : theme === "DARK" ? t("common.dark") : t("common.system")}
            </label>
          ))}
        </fieldset>
      </section>

      <section className="settings-form__section" aria-labelledby="preferences-title">
        <h2 id="preferences-title" className="settings-section-title">{t("settings.preferences")}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="settings-field min-w-0 max-w-full box-border" htmlFor="preferred-currency">
            <span className="block">{t("settings.preferredCurrency")}</span>
            <div className="mt-1 min-w-0 w-full max-w-full box-border">
              <ResponsiveSelect
                label={t("settings.preferredCurrency")}
                value={values.preferredCurrency}
                options={CURRENCIES.map(({ code, name }) => ({
                  value: code,
                  label: `${name} (${code})`,
                }))}
                onChange={(currency) => setValue("preferredCurrency", currency as CurrencyCode)}
                className="w-full"
              />
            </div>
          </label>
          <label className="settings-field min-w-0 max-w-full box-border" htmlFor="language">
            <span className="block">{t("settings.language")}</span>
            <div className="mt-1 min-w-0 w-full max-w-full box-border">
              <ResponsiveSelect
                label={t("settings.language")}
                value={values.language}
                options={LANGUAGES.map(({ code, name }) => ({
                  value: code,
                  label: name,
                }))}
                onChange={(language) => {
                  const nextLanguage = language as LanguageCode;
                  setValue("language", nextLanguage);
                  setLanguage(nextLanguage);
                }}
                className="w-full"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="settings-form__section settings-form__section--notifications" aria-labelledby="notifications-title">
        <h2 id="notifications-title" className="settings-section-title">{t("settings.notifications")}</h2>
        <div className="mt-4 space-y-2">
          {(["emailNotifications", "budgetAlerts"] as const).map((key) => (
            <label key={key} className="settings-toggle-row">
              <span>{t(`settings.${key}`)}</span>
              <input type="checkbox" checked={values[key]} onChange={(event) => setValue(key, event.target.checked)} className="settings-checkbox" />
            </label>
          ))}
        </div>
      </section>

      <div className="settings-form__footer">
        <p role="status" className="text-sm text-[var(--text-secondary)]">{error ?? (isSubmitting ? t("settings.saving") : saved ? t("settings.saved") : hasChanges ? t("settings.unsaved") : t("settings.noChanges"))}</p>
        <button type="submit" disabled={isSubmitting || !hasChanges} className="settings-primary-button">{isSubmitting ? t("settings.saving") : t("settings.save")}</button>
      </div>
    </form>
  );
}

export default SettingsForm;
