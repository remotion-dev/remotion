import { getBoundingBox, resetPath } from "@remotion/paths";
import React from "react";
import { AbsoluteFill } from "remotion";
import { countriesPaths, ISO_3166_ALPHA_2_MAPPINGS } from "./paths";

export const CurrentCountry: React.FC = () => {
  const country = "US";
  const paths = countriesPaths.filter((c) => c.class === country);
  const joined = paths.map((p) => p.d).join(" ");
  const reset = resetPath(joined);
  const boundingBox = getBoundingBox(reset);

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <svg
          viewBox={boundingBox.viewBox}
          style={{
            scale: "0.6",
          }}
        >
          <path fill="#222" d={reset} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill>
        <div
          style={{
            fontFamily: "GT Planar",
            textAlign: "center",
          }}
        >
          {ISO_3166_ALPHA_2_MAPPINGS[country]}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
