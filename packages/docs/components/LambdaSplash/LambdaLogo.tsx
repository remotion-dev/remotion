import React from "react";

const align: React.CSSProperties = {
  textAlign: "center",
  fontWeight: "bold",
  fontSize: 30,
};

export const LambdaLogo: React.FC = () => {
  return <div style={align}>@remotion/lambda</div>;
};
