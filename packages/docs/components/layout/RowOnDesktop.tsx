import React from "react";

export const RowOnDesktop: React.FC<{
  readonly children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>{children}</div>
  );
};
