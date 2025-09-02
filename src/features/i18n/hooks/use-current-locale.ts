"use client";

import { useLocaleContext } from "$/features/i18n/components/LocaleProvider";

type Locale = "pl" | "en";

export default function useCurrentLocale(): Locale {
  const { locale } = useLocaleContext();
  return locale;
}

export function useHerouiLocale() {
  const { locale } = useLocaleContext();

  const supportedLocales: Record<Locale, string> = {
    pl: "pl-PL",
    en: "en-US",
  };

  return supportedLocales[locale];
}
