import { getBoundingBox, translatePath } from "@remotion/paths";
import { makeStar } from "@remotion/shapes";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React, { useMemo, useState } from "react";
import { AbsoluteFill, random } from "remotion";

type CustomPresentationProps = {
  width: number;
  height: number;
};

const SlidePresentation: React.FC<
  TransitionPresentationComponentProps<CustomPresentationProps>
> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const finishedRadius =
    Math.sqrt(passedProps.width ** 2 + passedProps.height ** 2) / 2;
  const innerRadius = finishedRadius * presentationProgress;
  const outerRadius = finishedRadius * 2 * presentationProgress;

  const { path } = makeStar({
    innerRadius,
    outerRadius,
    points: 5,
  });

  const boundingBox = getBoundingBox(path);

  const translatedPath = translatePath(
    path,
    passedProps.width / 2 - boundingBox.width / 2,
    passedProps.height / 2 - boundingBox.height / 2,
  );

  const [clipId] = useState(() => String(random(null)));

  const style: React.CSSProperties = useMemo(() => {
    return {
      width: "100%",
      height: "100%",
      clipPath:
        presentationDirection === "exiting" ? undefined : `url(#${clipId})`,
    };
  }, [clipId, presentationDirection]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {presentationDirection === "exiting" ? null : (
        <AbsoluteFill>
          <svg>
            <defs>
              <clipPath id={clipId}>
                <path d={translatedPath} fill="black" />
              </clipPath>
            </defs>
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const customPresentation = (
  props: CustomPresentationProps,
): TransitionPresentation<CustomPresentationProps> => {
  return { component: SlidePresentation, props };
};
