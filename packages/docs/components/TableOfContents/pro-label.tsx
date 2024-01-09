import React from "react";

export const ProLabel: React.FC = () => {
  return (
    <div
      style={{
        display: "inline-block",
        border: "1px solid",
        borderColor: "var(--border-color)",
        fontSize: 12,
        paddingLeft: 6,
        paddingRight: 6,
        marginLeft: 5,
      }}
    >
      <span
        style={{
          opacity: 0.8,
          color: "var(--text-color)",
        }}
      >
        Paid
      </span>
    </div>
  );
};
