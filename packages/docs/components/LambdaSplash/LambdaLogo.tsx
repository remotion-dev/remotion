import React from "react";

const align: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: 20,
  color: "var(--ifm-color-primary)",
};

export const LambdaLogo: React.FC = () => {
  return <div style={align}>@remotion/lambda</div>;
};
