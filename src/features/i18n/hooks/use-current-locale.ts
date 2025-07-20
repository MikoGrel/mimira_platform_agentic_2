"use client";

import { useEffect, useState } from "react";

type Locale = "pl" | "en";

export default function useCurrentLocale() {
  const [locale, setLocale] = useState<string>("en"); // Default fallback

  useEffect(() => {
    // Get initial locale from HTML lang attribute
    const getLocale = () => {
      return document.documentElement.lang || "en";
    };

    setLocale(getLocale());

    // Optional: Listen for changes to the lang attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "lang"
        ) {
          setLocale(getLocale());
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    return () => observer.disconnect();
  }, []);

  return locale as Locale;
}
