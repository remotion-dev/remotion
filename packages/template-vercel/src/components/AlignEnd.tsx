import React from "react";

export const AlignEnd: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={`self-end ${className ?? ""}`}>{children}</div>;
};
