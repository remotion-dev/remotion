import React, { useMemo } from "react";
import styles from "./styles.module.css";
import type { Option } from "./types";

const left: React.CSSProperties = {
  width: 100,
  fontFamily: "GTPlanar",
  flex: 1,
  flexDirection: "row",
  display: "flex",
  alignItems: "center",
};

const check: React.CSSProperties = {
  marginRight: 5,
};

const right: React.CSSProperties = {
  width: 40,
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
  const enabled = value !== null;

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
      width: 80,
      marginRight: 8,
    }),
    []
  );

  if (option.type !== "numeric") {
    throw new Error("numeric");
  }

  return (
    <label style={labelStyle} className={styles.item}>
      <div style={left}>
        {option.optional === "no" ? null : (
          <input
            onChange={(c) => {
              if (c.target.checked) {
                console.log(c.target.checked);
                setValue(option.default);
              } else {
                setValue(null);
              }
            }}
            style={check}
            checked={enabled}
            type={"checkbox"}
          />
        )}
        {`${option.name}`}
      </div>
      <input
        type="range"
        min={option.min}
        max={option.max}
        step={option.step}
        value={value as number}
        style={inputStyle}
        disabled={!enabled}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <div style={right}>
        <code>{value}</code>
      </div>
    </label>
  );
};
