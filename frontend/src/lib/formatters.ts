import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from "../domain/enums/currency";

export const formatCurrency = (
  value: number,
  currency: string = DEFAULT_CURRENCY,
  locale = "en-US",
): string => {
  const safeCurrency: CurrencyCode = isCurrencyCode(currency) ? currency : DEFAULT_CURRENCY;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
