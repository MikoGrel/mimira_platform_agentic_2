// hero.ts
import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      layout: {
        borderWidth: {
          small: "1px",
          medium: "1px",
          large: "1px",
        },
      },
    },
    dark: {
      colors: {},
    },
  },
});
