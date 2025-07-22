"use client";

import { useEffect } from "react";
import { useMedia } from "react-use";

export default function useFavicon() {
  const prefersDark = useMedia("(prefers-color-scheme: dark)", false);

  useEffect(() => {
    const lightSchemeIcon = document.querySelector("link#light-scheme-icon");
    const darkSchemeIcon = document.querySelector("link#dark-scheme-icon");

    if (!lightSchemeIcon || !darkSchemeIcon) {
      return;
    }

    if (prefersDark) {
      lightSchemeIcon.remove();
      if (!document.head.contains(darkSchemeIcon)) {
        document.head.appendChild(darkSchemeIcon);
      }
    } else {
      darkSchemeIcon.remove();
      if (!document.head.contains(lightSchemeIcon)) {
        document.head.appendChild(lightSchemeIcon);
      }
    }
  }, [prefersDark]);
}
