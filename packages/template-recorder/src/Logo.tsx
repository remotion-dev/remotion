import React from "react";

const style: React.CSSProperties = {
  height: 48 / 1.8,
  width: 246 / 1.8,
};

export const Logo: React.FC = () => {
  return <img style={style} src="/logo.png" />;
};
