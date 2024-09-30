import React from "react";

const container: React.CSSProperties = {
  alignSelf: "flex-end",
};

export const AlignEnd: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div style={container}>{children}</div>;
};
