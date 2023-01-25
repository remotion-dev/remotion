import React from "react";

const outer: React.CSSProperties = {
  width: 90,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  color: "var(--light-text-color)",
  cursor: "pointer",
  filter: "drop-shadow(0px 0px 4px var(--background))",
};

const icon: React.CSSProperties = {
  display: "flex",
  width: 50,
  height: 50,
  justifyContent: "center",
  alignItems: "center",
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
};

export const TemplateIcon: React.FC<{
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}> = ({ children, label, onClick }) => {
  return (
    <a style={outer} onClick={onClick}>
      <div style={icon}>{children}</div>
      <div style={labelStyle}>{label}</div>
    </a>
  );
};
