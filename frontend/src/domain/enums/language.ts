export const LANGUAGES = [{ code: "en", name: "English" }] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const isLanguageCode = (value: string): value is LanguageCode =>
  LANGUAGES.some((language) => language.code === value);