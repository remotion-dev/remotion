import { Rect } from "@remotion/shapes";
import React from "react";

export const RectEdgeRoundness = () => {
  return (
    <>
      <h3>
        <code>edgeRoundness</code>
      </h3>
      <p>
        <em>null | number</em>
      </p>
      <p>
        Allows to modify the shape by rounding the edges using bezier curves.
        Default <code>null</code>.
      </p>
      <table>
        <tr>
          <td>
            <Rect
              fill="#0b84f3"
              debug
              edgeRoundness={0}
              height={80}
              width={80}
            />
          </td>
          <td>
            <code>0</code> will lead to a rotated rectangle being drawn inside
            the natural dimensions of the rectangle.
          </td>
        </tr>
        <tr>
          <td>
            <Rect
              fill="#0b84f3"
              debug
              edgeRoundness={(4 * (Math.sqrt(2) - 1)) / 3}
              height={80}
              width={80}
            />
          </td>
          <td>
            <code>(4 * (Math.sqrt(2) - 1)) / 3</code> will{" "}
            <a
              target={
                "https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%c3%a9zier-curves/27863181#27863181"
              }
            >
              draw a circle
            </a>
            .
          </td>
        </tr>
        <tr>
          <td>
            <Rect
              fill="#0b84f3"
              debug
              edgeRoundness={1}
              height={80}
              width={80}
            />
          </td>
          <td>
            <code>1</code> will{" "}
            <a
              target={
                "https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%c3%a9zier-curves/27863181#27863181"
              }
            >
              draw a squircle.
            </a>
            .
          </td>
        </tr>
      </table>
    </>
  );
};
