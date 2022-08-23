import React from "react";

export const InlineStep: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div
      style={{
        backgroundColor: "var(--ifm-color-primary)",
        height: 24,
        width: 24,
        display: "inline-flex",
        color: "white",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: "bold",
      }}
    >
      {children}
    </div>
  );
};
