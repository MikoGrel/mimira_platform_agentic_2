"use client";

import { useCurrentUser } from "$/features/auth/api";
import { useLingoLocale, setLingoLocale } from "lingo.dev/react-client";
import { useRef, useEffect } from "react";

export function useLocaleRestorer() {
  const localeRestored = useRef(false);

  const { user } = useCurrentUser();
  const currentLocale = useLingoLocale();

  useEffect(() => {
    if (localeRestored.current || !user || !currentLocale) return;

    if (currentLocale !== user.profile?.preferred_locale) {
      setLingoLocale(user.profile?.preferred_locale as string);
      localeRestored.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentLocale]);
}
