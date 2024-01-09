import React, { useEffect } from "react";

export const useImport = <T>(im: Promise<T>): T | null => {
  const [imported, setImported] = React.useState<T | null>(null);

  useEffect(() => {
    im.then((i) => {
      setImported(i);
    });
  }, [im]);

  return imported;
};
