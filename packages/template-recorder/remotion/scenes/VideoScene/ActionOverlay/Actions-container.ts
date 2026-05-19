import React, { useMemo } from "react";

const container: React.CSSProperties = {
  height: 100,
  backgroundImage: `linear-gradient(to top,${gradientSteps
    .map((g, i) => {
      return `hsla(0, 100%, 100%, ${g}) ${
        (gradientOpacities[i] as number) * globalGradientOpacity
      }%`;
    })
    .join(", ")}, hsl(0, 0%, 0%) 100%)`,
  top: 0,
  position: "absolute",
  justifyContent: "center",
  color: "white",
  display: "flex",
  transition: "opacity 0.15s",
};

