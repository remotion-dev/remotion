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
      <Card refToUse={refs[0]} index={0} />
      <Card refToUse={refs[1]} index={1} />
      <Card refToUse={refs[2]} index={2} />
      <Card refToUse={refs[3]} index={3} />
    </AbsoluteFill>
  );
};
