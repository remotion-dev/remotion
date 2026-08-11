import React, { useMemo } from "react";
import { BASE_SIZE } from "./constants";

export const AudioVizContainer: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      flexDirection: "row",
      height: `${BASE_SIZE * 4}px`,
      alignItems: "center",
      justifyContent: "center",
      gap: `${BASE_SIZE * 0.25}px`,
      marginTop: `${BASE_SIZE}px`,
    }),
    [],
  );

  return <div style={containerStyle}>{children}</div>;
};
