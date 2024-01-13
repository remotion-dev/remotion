import { getBoundingBox, resetPath } from "@remotion/paths";
import React from "react";
import { AbsoluteFill } from "remotion";
import { countriesPaths } from "./paths";

export const CurrentCountry: React.FC = () => {
  const paths = countriesPaths.filter((c) => c.class === "US");
  const joined = paths.map((p) => p.d).join(" ");
  const reset = resetPath(joined);
  const boundingBox = getBoundingBox(reset);

  return (
    <AbsoluteFill>
      <svg
        viewBox={boundingBox.viewBox}
        style={{
          height: "100%",
          width: "100%",
          scale: "0.6",
        }}
      >
        <path fill="#222" d={reset} />
      </svg>
    </AbsoluteFill>
  );
};
