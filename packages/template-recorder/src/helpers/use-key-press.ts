import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export const useKeyPress = ({
  keys,
  callback,
  metaKey,
}: {
  keys: string[];
  callback: (event: KeyboardEvent) => void;
  metaKey: boolean;
}) => {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (
        keys.some(
          (key: string) => event.key === key && event.metaKey === metaKey,
        )
      ) {
        callbackRef.current(event);
      }
    },
    [keys, metaKey],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
};
