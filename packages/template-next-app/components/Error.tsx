import React from "react";

const container: React.CSSProperties = {
  color: "var(--geist-error)",
  fontFamily: "var(--geist-font)",
  paddingTop: "var(--geist-half-pad)",
  paddingBottom: "var(--geist-half-pad)",
};

const icon: React.CSSProperties = {
  height: 20,
  verticalAlign: "text-bottom",
  marginRight: 6,
};

export const ErrorComp: React.FC<{
  message: string;
}> = ({ message }) => {
  return (
    <div style={container}>
      <svg
        fill="none"
        shapeRendering="geometricPrecision"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        style={icon}
      >
        <circle cx="12" cy="12" r="10" fill="var(--geist-fill)"></circle>
        <path d="M12 8v4" stroke="currentColor"></path>
        <path d="M12 16h.01" stroke="currentColor"></path>
      </svg>
      <strong>Error:</strong> {message}
    </div>
  );
};
