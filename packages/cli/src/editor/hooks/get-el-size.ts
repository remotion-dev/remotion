import { useEffect, useState, useCallback, useMemo } from "react";

export type Size = {
  width: number;
  height: number;
};

export const useElementSize = (
  ref: React.RefObject<HTMLDivElement>
): Size | null => {
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
  const [size, setSize] = useState<Size | null>(null);
  const updateSize = useCallback(() => {
    if (!ref.current) {
      return;
    }
    const rect = ref.current.getClientRects();
    setSize({
      width: rect[0].width as number,
      height: rect[0].height as number,
    });
  }, []);

  useEffect(() => {
    updateSize();
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);
  return size;
};
