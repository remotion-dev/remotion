import React, { useState } from "react";
import { random } from "remotion";
import type { ThreeDReducedInstruction } from "./3d-svg";
import { threeDIntoSvgPath } from "./3d-svg";

export type FaceSVGProps = {
  strokeLinecap?: React.SVGAttributes<SVGPathElement>["strokeLinecap"];
  strokeMiterlimit?: React.SVGAttributes<SVGPathElement>["strokeMiterlimit"];
};

export const Face: React.FC<
  {
    points: ThreeDReducedInstruction[];
    color: string;
    strokeColor: string;
    strokeWidth: number;
  } & FaceSVGProps
> = ({
  color,
  points,
  strokeColor,
  strokeWidth,
  strokeMiterlimit,
  strokeLinecap,
}) => {
  const [id] = useState(() => random(null).toString().replace(".", ""));
  const d = threeDIntoSvgPath(points);

  return (
    <>
      <defs>
        {strokeWidth ? (
          <mask id={id}>
            <path
              strokeLinecap={strokeLinecap}
              shapeRendering="crispEdges"
              strokeMiterlimit={strokeMiterlimit}
              strokeWidth={strokeWidth}
              d={d}
              fill="white"
            />
          </mask>
        ) : null}
      </defs>
      <path
        d={d}
        fill={color}
        mask={strokeWidth ? `url(#${id})` : undefined}
        stroke={strokeColor}
        strokeMiterlimit={strokeMiterlimit}
        shapeRendering="crispEdges"
        strokeLinecap={strokeLinecap}
        strokeWidth={strokeWidth}
      />
    </>
  );
};
