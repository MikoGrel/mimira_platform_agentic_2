"use client";

import { pl } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { format, formatRelative } from "date-fns";

import useCurrentLocale from "./use-current-locale";

export function useDateFormat() {
  const locale = useCurrentLocale();

  const getDateFnsLocale = (locale: "pl" | "en") => {
    switch (locale) {
      case "en":
        return enUS;
      case "pl":
        return pl;
      default:
        return enUS;
    }
  };

  const relativeToNow = (d: Date) =>
    formatRelative(d, new Date(), { locale: getDateFnsLocale(locale) });

  const readableMonth = (d: Date) =>
    format(d, "MMMM", { locale: getDateFnsLocale(locale) });

  return {
    relativeToNow,
    readableMonth,
  };
}
