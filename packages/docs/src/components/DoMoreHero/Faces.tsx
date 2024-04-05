import React from "react";
import type { FaceSVGProps } from "./Face";
import { Face } from "./Face";
import type { ThreeDElement } from "./element";
import type { FaceType } from "./map-face";

const sortFacesZIndex = (face: FaceType[]): FaceType[] => {
  return face.slice().sort((a, b) => {
    return b.centerPoint[2] - a.centerPoint[2];
  });
};

export const Faces: React.FC<
  {
    elements: ThreeDElement[];
    noSort?: boolean;
  } & FaceSVGProps
> = ({ elements, noSort, ...svgProps }) => {
  const sortedElement = noSort
    ? elements
    : elements.sort((a, b) => {
        return b.centerPoint[2] - a.centerPoint[2];
      });

  return (
    <>
      {sortedElement.map((element, i) => {
        const sortedFaces = sortFacesZIndex(element.faces);

        return (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            {sortedFaces.map(
              (
                { points, color, strokeWidth, strokeColor, crispEdges },
                idx,
              ) => {
                return (
                  <Face
                    // eslint-disable-next-line react/no-array-index-key
                    key={JSON.stringify(points) + idx}
                    strokeColor={strokeColor}
                    color={color}
                    points={points}
                    strokeWidth={strokeWidth}
                    crispEdges={crispEdges}
                    {...svgProps}
                  />
                );
              },
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
