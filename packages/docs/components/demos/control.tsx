import React, { useMemo } from "react";
import type { Option } from "./types";

export const Control = ({
  option,
  value,
  setValue,
}: {
  option: Option;
  value: number;
  setValue: (value: number) => void;
}) => {
  const labelStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      margin: 8,
    }),
    []
  );

  const inputStyle = useMemo<React.CSSProperties>(
    () => ({
      width: 90,
      marginRight: 8,
    }),
    []
  );

  if (option.type !== "numeric") {
    throw new Error("numeric");
  }

  return (
    <label style={labelStyle}>
      <input
        type="range"
        min={option.min}
        max={option.max}
        step={option.step}
        value={value as number}
        style={inputStyle}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <code>{`${option.name}={${value}}`}</code>
    </label>
  );
};
