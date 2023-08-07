import React from "react";

const link: React.CSSProperties = {
  textDecoration: "none",
  fontSize: 16,
  marginLeft: 8,
};

const label: React.CSSProperties = {
  fontSize: "0.9em",
  border: "1px solid var(--ifm-color-emphasis-300)",
  color: "var(--ifm-color-emphasis-600)",
  fontFamily: "GTPlanar",
  paddingLeft: 6,
  paddingRight: 6,
  borderRadius: 3,
  paddingTop: 2,
  paddingBottom: 2,
};

export const AvailableFrom: React.FC<{
  v: string;
}> = ({ v }) => {
  if (!v) {
    throw new Error("v is required");
  }

  if (v.startsWith("v")) {
    throw new Error("do not include v");
  }

  return (
    <a
      target={"_blank"}
      style={link}
      href={`https://github.com/remotion-dev/remotion/releases/v${v}`}
    >
      <span style={label} title={`Added in v${v}`}>
        v{v}
      </span>
    </a>
  );
};
