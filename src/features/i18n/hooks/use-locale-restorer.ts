"use client";

import { useCurrentUser } from "$/features/auth/api";
import { setLocale } from "$/features/i18n/actions";
import { useRef, useEffect } from "react";

type Locale = "pl" | "en";

export function useLocaleRestorer(currentLocale: Locale) {
  const localeRestored = useRef(false);
  const { user } = useCurrentUser();

  useEffect(() => {
    if (localeRestored.current || !user || !currentLocale) return;

    if (currentLocale !== user.profile?.preferred_locale) {
      setLocale(user.profile?.preferred_locale as Locale);
      localeRestored.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentLocale]);
}
