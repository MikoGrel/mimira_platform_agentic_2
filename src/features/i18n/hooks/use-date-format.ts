"use client";

import { pl } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { format, formatRelative } from "date-fns";

import useCurrentLocale from "./use-current-locale";

const isFeminineWeekday = (day: number): boolean => {
  return day === 3 || day === 6;
};

const plLocale = {
  ...pl,
  formatRelative: (token: string, date?: Date) => {
    const formatRelativeLocale = {
      lastWeek: (date: Date) => {
        const day = date.getDay();
        const isFeminine = isFeminineWeekday(day);
        return isFeminine ? "'Poprzednia' eeee" : "'Poprzedni' eeee";
      },
      yesterday: "'Wczoraj'",
      today: "'Dziś'",
      tomorrow: "'Jutro'",
      nextWeek: (date: Date) => {
        const day = date.getDay();
        const isFeminine = isFeminineWeekday(day);
        return isFeminine ? "'Następna' eeee" : "'Następny' eeee";
      },
      other: "dd.MM.yyyy",
    };

    const format =
      formatRelativeLocale[token as keyof typeof formatRelativeLocale];

    if (typeof format === "function" && date) {
      return format(date);
    }

    return format as string;
  },
};

const enLocale = {
  ...enUS,
  formatRelative: (token: string) =>
    ({
      lastWeek: "'Last' eeee",
      yesterday: "'Yesterday'",
      today: "'Today'",
      tomorrow: "'Tomorrow'",
      nextWeek: "'Next' eeee",
      other: "dd.MM.yyyy",
    })[token] as string,
};

export function useDateFormat() {
  const locale = useCurrentLocale();

  const getDateFnsLocale = (locale: "pl" | "en") => {
    switch (locale) {
      case "en":
        return enLocale;
      case "pl":
        return plLocale;
      default:
        return enLocale;
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
