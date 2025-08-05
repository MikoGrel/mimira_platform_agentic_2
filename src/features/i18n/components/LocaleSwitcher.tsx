"use client";

import React, { useTransition } from "react";
import { usePathname } from "next/navigation";
import { Select, SelectItem } from "@heroui/react";
import { setLocale } from "$/features/i18n/actions";
import useCurrentLocale from "$/features/i18n/hooks/use-current-locale";

type Locale = "pl" | "en";

interface LocaleSwitcherProps {
  locales: Locale[];
}

const localeLabels = {
  pl: "Polish",
  en: "English",
} as const;

export function LocaleSwitcher({ locales }: LocaleSwitcherProps) {
  const currentLocale = useCurrentLocale();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (keys: Set<React.Key> | "all") => {
    if (keys === "all") return;
    const newLocale = Array.from(keys)[0] as Locale;
    if (newLocale === currentLocale) return;

    startTransition(async () => {
      await setLocale(newLocale, pathname);
      // Force a page refresh to update the layout
      window.location.reload();
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
        trigger: "bg-white",
      }}
    >
      {locales.map((locale) => (
        <SelectItem key={locale}>{localeLabels[locale]}</SelectItem>
      ))}
    </Select>
  );
}
