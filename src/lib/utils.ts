import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currencyCode: string = "BRL"): string {
  const locales: Record<string, string> = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
  };

  return new Intl.NumberFormat(locales[currencyCode] || "pt-BR", {
    style: "currency",
    currency: currencyCode,
  }).format(value);
}

export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();

  if (dateString.includes("T")) {
    return new Date(dateString);
  }

  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(date: Date | string, locale: string = "pt-BR"): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
