import React, { useMemo } from "react";
import styles from "./styles.module.css";
import type { Option } from "./types";

const left: React.CSSProperties = {
  width: 100,
  fontFamily: "GTPlanar",
  flex: 1,
};

const right: React.CSSProperties = {
  width: 50,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};

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
    <label style={labelStyle} className={styles.item}>
      <div style={left}>{`${option.name}`}</div>
      <input
        type="range"
        min={option.min}
        max={option.max}
        step={option.step}
        value={value as number}
        style={inputStyle}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <div style={right}>
        <code>{value}</code>
      </div>
    </label>
  );
};
