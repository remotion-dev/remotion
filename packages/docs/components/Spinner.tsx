import React from "react";

const css: React.CSSProperties = {
  border: "10px solid #f3f3f3",
  borderTop: "10px solid var(--ifm-color-primary)",
  borderRadius: "50%",
  width: "80px",
  height: "80px",
  animation: "spin 1s linear infinite",
};

export const Spinner: React.FC = () => <div style={css} />;
