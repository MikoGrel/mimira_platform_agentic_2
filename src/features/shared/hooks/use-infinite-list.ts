import { useRef, useEffect } from "react";

interface UseInfiniteListOptions {
  options?: IntersectionObserverInit;
  onIntersect: () => void;
  pageSize: number;
  elementMargin?: number;
}

export function useInfiniteList<T extends HTMLElement = HTMLDivElement>({
  options,
  onIntersect,
  pageSize,
  elementMargin = 3,
}: UseInfiniteListOptions) {
  const loadMoreRef = useRef<T>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px 0px",
        ...options,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [onIntersect, options]);

  const getRef = (index: number) => {
    return index % pageSize <= pageSize - elementMargin && !loadMoreRef.current
      ? loadMoreRef
      : null;
  };

  return { getRef };
}
