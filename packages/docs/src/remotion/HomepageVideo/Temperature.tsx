import React from "react";
import { AbsoluteFill } from "remotion";

export const Temperature: React.FC<{
  theme: "dark" | "light";
}> = ({ theme }) => {
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div
          style={{
            color: "#0b84f3",
            fontFamily: "GT Planar",
            fontWeight: "500",
            fontSize: 13,
            textAlign: "center",
            marginTop: -7,
          }}
        >
          Temperature
        </div>
        <div
          style={{
            lineHeight: 1.1,
            fontFamily: "GT Planar",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 60,
            color: theme === "dark" ? "white" : "black",
            fontFeatureSettings: "'ss03' 1",
          }}
        >
          23°C
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
