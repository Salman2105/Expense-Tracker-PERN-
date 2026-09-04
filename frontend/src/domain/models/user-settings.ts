import type { Theme } from "../enums/theme";
import type { CurrencyCode } from "../enums/currency";
import type { LanguageCode } from "../enums/language";

export interface UserSettings {
  settingsId: string;
  userId: string;
  preferredCurrency: CurrencyCode;
  language: LanguageCode;
  theme: Theme;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  createdAt: string;
  updatedAt: string;
}
