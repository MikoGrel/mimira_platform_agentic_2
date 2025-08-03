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
      if (containerRef?.current) {
        const scrollTop = containerRef.current.scrollTop;
        const shouldTrigger = scrollTop > threshold;

        setIsTriggered((prev) =>
          prev !== shouldTrigger ? shouldTrigger : prev
        );
      } else {
        const scrollTop = window.scrollY;
        const shouldTrigger = scrollTop > threshold;

        setIsTriggered((prev) =>
          prev !== shouldTrigger ? shouldTrigger : prev
        );
      }
    };

    const scrollElement = containerRef?.current;

    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => {
        scrollElement.removeEventListener("scroll", handleScroll);
      };
    } else {
      window.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [threshold, containerRef?.current]);

  return isTriggered;
}
