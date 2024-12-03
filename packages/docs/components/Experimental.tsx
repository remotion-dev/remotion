import React from "react";

export const ExperimentalBadge: React.FC<{
  readonly children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div
      style={{
        backgroundColor: "rgba(246, 229, 141, 0.3)",
        borderRadius: 8,
        padding: "12px 12px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          backgroundColor: "#f6e58d",
          display: "inline-block",
          padding: "3px 10px",
          fontWeight: "bold",
          borderRadius: 5,
          fontSize: 14,
          marginBottom: 10,
          color: "black",
        }}
      >
        EXPERIMENTAL
      </div>
      <div>{children}</div>
    </div>
  );
};
