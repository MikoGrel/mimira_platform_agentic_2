"use client";

import React, { useTransition } from "react";
import { Select, SelectItem } from "@heroui/react";
import useCurrentLocale from "$/features/i18n/hooks/use-current-locale";
import { setLingoLocale } from "lingo.dev/react/client";
import { useUpdateProfile } from "$/features/auth/api/use-update-profile";
import { useCurrentUser } from "$/features/auth/api";

type Locale = "pl" | "en";

interface LocaleSwitcherProps {
  locales: Locale[];
}

const localeLabels = {
  pl: "Polish",
  en: "English",
} as const;

export function LocaleSwitcher({ locales }: LocaleSwitcherProps) {
  const { user } = useCurrentUser();
  const { mutate: updateProfile } = useUpdateProfile();
  const currentLocale = useCurrentLocale();
  const [isPending] = useTransition();

  const handleLocaleChange = (keys: Set<React.Key> | "all") => {
    if (keys === "all" || !user) return;
    const newLocale = Array.from(keys)[0] as Locale;
    if (newLocale === currentLocale) return;

    setLingoLocale(newLocale);
    updateProfile({
      preferred_locale: newLocale,
      id: user.profile!.id,
    });
  };

  return (
    <Select
      aria-label="Select language"
      selectedKeys={[currentLocale]}
      onSelectionChange={handleLocaleChange}
      isDisabled={isPending}
      radius="full"
      variant="bordered"
      className="w-28"
      classNames={{
        trigger: "bg-background",
      }}
    >
      {locales.map((locale) => (
        <SelectItem key={locale}>{localeLabels[locale]}</SelectItem>
      ))}
    </Select>
  );
}
