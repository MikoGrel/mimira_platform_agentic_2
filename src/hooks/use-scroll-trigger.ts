import * as React from "react";

interface UseScrollTriggerOptions {
  /** The scroll position threshold in pixels */
  threshold: number;
  /** The scroll container element ref. If not provided, uses window scroll */
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * A hook that tracks scroll position and triggers a boolean state change
 * when the scroll position crosses a specified threshold.
 *
 * @param options - Configuration options for the scroll trigger
 * @returns boolean indicating whether the scroll position is past the threshold
 */
export function useScrollTrigger({
  threshold,
  containerRef,
}: UseScrollTriggerOptions) {
  const [isTriggered, setIsTriggered] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = containerRef?.current
        ? containerRef.current.scrollTop
        : window.scrollY;
      const shouldTrigger = scrollTop > threshold;

      setIsTriggered((prev) => (prev !== shouldTrigger ? shouldTrigger : prev));
    };

    const target: HTMLElement | Window = containerRef?.current ?? window;

    target.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, [threshold, containerRef]);

  return isTriggered;
}
