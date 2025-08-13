import React from "react";
import { useCurrentFrame } from "remotion";
import type { CanvasLayout } from "../../../config/layout";
import type { BRollWithDimensions } from "../../../config/scenes";
import type { BRollEnterDirection, Layout } from "../../layout/layout-types";
import { BRoll } from "./BRoll";

export const BRollStack: React.FC<{
  bRollLayout: Layout;
  bRolls: BRollWithDimensions[];
  bRollEnterDirection: BRollEnterDirection;
  canvasLayout: CanvasLayout;
}> = ({ bRollLayout, bRollEnterDirection, canvasLayout, bRolls }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {bRolls.map((roll, i) => {
        return (
          <BRoll
            key={i}
            bRoll={roll}
            bRollsBefore={bRolls.slice(i + 1)}
            sceneFrame={frame}
            bRollLayout={bRollLayout}
            bRollEnterDirection={bRollEnterDirection}
            canvasLayout={canvasLayout}
          />
        );
      })}
    </>
  );
};
