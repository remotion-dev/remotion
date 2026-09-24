import React, { useMemo } from "react";

export const ProgressBar: React.FC<{
  progress: number;
}> = ({ progress }) => {
  const style: React.CSSProperties = useMemo(() => {
    return {
      width: "100%",
      height: 10,
      borderRadius: 5,
      appearance: "none",
      backgroundColor: "var(--unfocused-border-color)",
      marginTop: 10,
      marginBottom: 25,
    };
  }, []);

  const fill: React.CSSProperties = useMemo(() => {
    return {
      backgroundColor: "var(--foreground)",
      height: 10,
      borderRadius: 5,
      transition: "width 0.1s ease-in-out",
      width: `${progress * 100}%`,
    };
  }, [progress]);

  return (
    <div>
      <div style={style}>
        <div style={fill}></div>
      </div>
    </div>
  );
};
