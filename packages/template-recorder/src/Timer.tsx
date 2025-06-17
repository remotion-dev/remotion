import React, { useEffect, useState } from "react";
import { formatMilliseconds } from "./helpers/format-time";

export const Timer: React.FC<{
  startDate: number;
}> = ({ startDate }) => {
  const [, setTime] = useState(0);
  useEffect(() => {
    const int = setInterval(() => {
      setTime(Date.now() - startDate);
    }, 1000);

    return () => {
      clearInterval(int);
    };
  }, [startDate]);

  return <>{formatMilliseconds(Date.now() - startDate)}</>;
};
