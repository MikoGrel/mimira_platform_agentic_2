"use client";

import { HeroUIProvider } from "@heroui/react";
import useFavicon from "$/hooks/use-favicon";
import { useHerouiLocale } from "$/features/i18n/hooks/use-current-locale";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useHerouiLocale();

  useFavicon();

  return <HeroUIProvider locale={locale}>{children}</HeroUIProvider>;
}
