import { useEffect, useState, type PropsWithChildren } from "react";

import { useAuth } from "../domain/auth/useAuth";
import { DEFAULT_LANGUAGE, type LanguageCode } from "../domain/enums/language";
import { useSettings } from "../features/settings/hooks/useSettings";
import { I18nContext } from "./i18n-context";
import { translations, type TranslationKey } from "./translations";

const readTranslation = (key: TranslationKey): string => {
  const [section, value] = key.split(".") as ["settings" | "common", string];
  return translations.en[section][value as never] as string;
};

export function I18nProvider({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const settingsQuery = useSettings(status === "AUTHENTICATED");
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    if (settingsQuery.data?.data.language === DEFAULT_LANGUAGE) {
      queueMicrotask(() => setLanguage(DEFAULT_LANGUAGE));
    }
  }, [settingsQuery.data?.data.language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: readTranslation }}>
      {children}
    </I18nContext.Provider>
  );
}

