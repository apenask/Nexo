import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AppLanguage = "pt-BR" | "en-US" | "es-ES";
export type AppCurrency = "BRL" | "USD" | "EUR";

const currencyLocaleMap: Record<AppCurrency, AppLanguage> = {
  BRL: "pt-BR",
  USD: "en-US",
  EUR: "es-ES",
};

export function getLocaleFromCurrency(currencyCode: string = "BRL"): string {
  return currencyLocaleMap[currencyCode as AppCurrency] || "pt-BR";
}

export function formatCurrency(
  value: number,
  currencyCode: string = "BRL",
  locale?: string
): string {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const resolvedLocale = locale || getLocaleFromCurrency(currencyCode);

  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(safeValue);
}

export function formatNumber(value: number, locale: string = "pt-BR"): string {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(safeValue);
}

export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();

  if (dateString.includes("T")) {
    return new Date(dateString);
  }

  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function formatDate(
  date: Date | string,
  locale: string = "pt-BR",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(options || {}),
  }).format(d);
}

export function normalizeMoneyInput(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

export function formatCurrencyInput(
  raw: string,
  currencyCode: string = "BRL",
  locale?: string
): string {
  const digits = normalizeMoneyInput(raw);
  const resolvedLocale = locale || getLocaleFromCurrency(currencyCode);

  if (!digits) {
    return "";
  }

  const numericValue = Number(digits) / 100;

  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function parseCurrencyInput(
  value: string | number,
  locale: string = "pt-BR"
): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (!value) return 0;

  const trimmed = String(value).trim();

  if (!trimmed) return 0;

  if (locale === "pt-BR" || locale === "es-ES") {
    const normalized = trimmed
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const normalized = trimmed.replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}