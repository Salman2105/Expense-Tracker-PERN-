export const translations = {
  en: {
    settings: {
      account: "Account",
      title: "Settings",
      appearance: "Appearance",
      appearanceDescription: "Choose how the application should be displayed.",
      preferences: "Preferences",
      preferredCurrency: "Preferred currency",
      language: "Language",
      notifications: "Notifications",
      emailNotifications: "Email notifications",
      budgetAlerts: "Budget alerts",
      save: "Save changes",
      saving: "Saving...",
      noChanges: "No changes to save",
      unsaved: "You have unsaved changes.",
      saved: "Changes saved successfully.",
      failed: "Failed to save changes.",
      loadingError: "We couldn't load your settings.",
      unavailable: "Settings unavailable",
      accountManagement: "Account management",
      accountDescription: "Review your account status and manage account deletion.",
      manageAccount: "Manage account",
      invalidCurrency: "Please select a supported currency.",
      invalidLanguage: "Please select a supported language.",
    },
    common: {
      light: "Light",
      dark: "Dark",
      system: "System",
      close: "Close navigation menu",
      open: "Open navigation menu",
      dashboard: "Dashboard",
      transactions: "Transactions",
      categories: "Categories",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      loggingOut: "Logging out...",
    },
  },
} as const;

export type TranslationKey =
  | `settings.${keyof typeof translations.en.settings}`
  | `common.${keyof typeof translations.en.common}`;