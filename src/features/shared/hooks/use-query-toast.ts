import { parseAsBoolean, useQueryState } from "nuqs";
import { ReactNode, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function useQueryToast(
  key: string,
  text: ReactNode,
  type: "success" | "error" | "warning" | "info"
) {
  const shown = useRef(false);
  const [value, setValue] = useQueryState(key, parseAsBoolean);

  useEffect(() => {
    if (value && !shown.current) {
      toast[type](text, {
        onAutoClose: () => {
          setValue(null);
        },
      });
      shown.current = true;
    }
  }, [value, text, setValue, type]);
}
