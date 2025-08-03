"use client";

import { HeroUIProvider } from "@heroui/react";
import useFavicon from "$/hooks/use-favicon";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useFavicon();

  return <HeroUIProvider>{children}</HeroUIProvider>;
}
