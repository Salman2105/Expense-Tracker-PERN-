export const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "Pound Sterling" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan Renminbi" },
  { code: "INR", name: "Indian Rupee" },
  { code: "PKR", name: "Pakistani Rupee" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export const DEFAULT_CURRENCY: CurrencyCode = "PKR";

export const isCurrencyCode = (value: string): value is CurrencyCode =>
  CURRENCIES.some((currency) => currency.code === value);