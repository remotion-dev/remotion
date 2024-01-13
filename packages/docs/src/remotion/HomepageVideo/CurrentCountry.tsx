import { getBoundingBox, resetPath } from "@remotion/paths";
import React from "react";
import { AbsoluteFill } from "remotion";
import { countriesPaths, ISO_3166_ALPHA_2_MAPPINGS } from "./paths";

export const CurrentCountry: React.FC = () => {
  const country = "FR";
  const paths = countriesPaths.filter((c) => c.class === country);
  const joined = paths.map((p) => p.d).join(" ");
  const reset = resetPath(joined);
  const boundingBox = getBoundingBox(reset);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{}}>
        <svg
          viewBox={boundingBox.viewBox}
          style={{
            scale: "0.8",
          }}
        >
          <path fill="#bbb" d={reset} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill />
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
          }}
        >
          Your location
        </div>
        <div
          style={{
            lineHeight: 1.1,
            fontFamily: "GT Planar",
            textAlign: "center",
            fontWeight: "500",
            fontSize: 30,
          }}
        >
          {ISO_3166_ALPHA_2_MAPPINGS[country]}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
