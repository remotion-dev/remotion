import React from "react";
import { ResolutionAndFps } from "./Stream";

export const PrefixLabel: React.FC<{
  prefix: string;
}> = ({ prefix }) => {
  return (
    <div
      style={{
        fontSize: 13,
        textAlign: "left",
      }}
    >
      <span style={{ textTransform: "uppercase" }}>{prefix}</span>
    </div>
  );
};

export const Resolution: React.FC<{
  resolution: ResolutionAndFps;
}> = ({ resolution }) => {
  return (
    <>
      <span
        style={{
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          {resolution.width}x{resolution.height},{" "}
          {Math.round(resolution.fps * 100) / 100} FPS
        </span>
      </span>
    </>
  );
};
