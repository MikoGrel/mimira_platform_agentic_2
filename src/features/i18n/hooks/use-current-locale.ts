"use client";

import { useLocaleContext } from "$/features/i18n/components/LocaleProvider";

type Locale = "pl" | "en";

export default function useCurrentLocale(): Locale {
  const { locale } = useLocaleContext();
  return locale;
}
