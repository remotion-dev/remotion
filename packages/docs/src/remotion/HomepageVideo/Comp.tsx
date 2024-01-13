import React, { createRef, useState } from "react";
import { AbsoluteFill } from "remotion";
import { Card, paddingAndMargin } from "./Card";

export const Comp: React.FC = () => {
  const [refs] = useState(() => {
    return new Array(4).fill(true).map(() => {
      return createRef<HTMLDivElement>();
    });
  });

  return (
    <AbsoluteFill
      style={{
        padding: paddingAndMargin,
        backgroundColor: "white",
      }}
    >
      <Card refsToUse={refs} index={0} />
      <Card refsToUse={refs} index={1} />
      <Card refsToUse={refs} index={2} />
      <Card refsToUse={refs} index={3} />
    </AbsoluteFill>
  );
};
