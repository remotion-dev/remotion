import React from "react";
import { RED } from "./layout/colors";

export const InlineStep: React.FC<{
  children: React.ReactNode;
  error?: boolean;
}> = ({ children, error }) => {
  return (
    <div
      style={{
        backgroundColor: error ? RED : "var(--ifm-color-primary)",
        height: 24,
        width: 24,
        display: "inline-flex",
        color: "white",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: "bold",
        verticalAlign: "top",
      }}
    >
      {children}
    </div>
  );
};

export const Step: React.FC<{
  children: React.ReactNode;
  error?: boolean;
}> = ({ children, error }) => {
  return (
    <span
      style={{
        marginRight: 7,
        display: "inline-block",
        position: "relative",
        marginTop: 4,
        marginBottom: 4,
      }}
    >
      <InlineStep error={error}>{children}</InlineStep>{" "}
    </span>
  );
};
