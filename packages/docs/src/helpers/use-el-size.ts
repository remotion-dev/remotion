import { useCallback, useEffect, useMemo, useState } from "react";

export type Size = {
  width: number;
  height: number;
};

export const useElementSize = (ref: HTMLElement): Size | null => {
  const [size, setSize] = useState<Size | null>(null);
  const observer = useMemo(
    () =>
      new ResizeObserver((entries) => {
        setSize({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }),
    []
  );
  const updateSize = useCallback(() => {
    const rect = ref.getClientRects();
    setSize({
      width: rect[0].width as number,
      height: rect[0].height as number,
    });
  }, [ref]);

  useEffect(() => {
    updateSize();
    if (ref) {
      observer.observe(ref);
    }
    return (): void => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [observer, ref, updateSize]);
  return size;
};
