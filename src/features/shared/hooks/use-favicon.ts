"use client";

import { useEffect } from "react";
import { useMedia } from "react-use";

export default function useFavicon() {
  const prefersDark = useMedia("(prefers-color-scheme: dark)");

  useEffect(() => {
    const lightSchemeIcon = document.querySelector("link#light-scheme-icon");
    const darkSchemeIcon = document.querySelector("link#dark-scheme-icon");

    if (prefersDark) {
      lightSchemeIcon?.remove();
      document.head.appendChild(darkSchemeIcon!);
    } else {
      darkSchemeIcon?.remove();
      document.head.appendChild(lightSchemeIcon!);
    }
  }, [prefersDark]);
}
