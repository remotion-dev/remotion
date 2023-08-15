import { Rect, Triangle } from "@remotion/shapes";
import React from "react";

const Header: React.FC = () => {
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
    </>
  );
};

export const DebugOption: React.FC = () => {
  return (
    <>
      <h3>
        <code>debug</code>
      </h3>
      <p>
        <em>boolean</em>
      </p>
      <p>
        If enabled, draws the lines for Bézier curves. This is meant for
        debugging, note that the visuals may change in any version.
      </p>
    </>
  );
};

export const RectEdgeRoundness: React.FC = () => {
  return (
    <>
      <Header />
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
            <code>1</code> will draw a squircle.
          </td>
        </tr>
        <tr>
          <td
            style={{
              overflow: "hidden",
            }}
          >
            <Rect
              fill="#0b84f3"
              debug
              edgeRoundness={2}
              height={80}
              width={80}
            />
          </td>
          <td>
            Values below <code>0</code> and above <code>1</code> are possible
            and may result in interesting shapes. Pictured: <code>2</code>
          </td>
        </tr>
      </table>{" "}
      <p>
        Cannot be used together with <code>cornerRadius</code>.
      </p>
    </>
  );
};

export const TriangleEdgeRoundness = () => {
  return (
    <>
      <Header />
      <table>
        <tr>
          <td>
            <Triangle
              fill="#0b84f3"
              debug
              edgeRoundness={0}
              length={80}
              direction="up"
            />
          </td>
          <td>
            <code>0</code> will lead to a rotated triangle being drawn inside
            the natural dimensions of the triangle.
          </td>
        </tr>
        <tr>
          <td>
            <Triangle
              fill="#0b84f3"
              debug
              edgeRoundness={Math.sqrt(2) - 1}
              length={80}
              direction="up"
            />
          </td>
          <td>
            <code>Math.sqrt(2) - 1</code> will{" "}
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
            <Triangle
              fill="#0b84f3"
              debug
              edgeRoundness={1}
              length={80}
              direction="up"
            />
          </td>
          <td>
            <code>1</code> will draw a shape similar to a {'"squircle"'} but as
            a triangle.
          </td>
        </tr>
        <tr>
          <td
            style={{
              overflow: "hidden",
            }}
          >
            <Triangle
              fill="#0b84f3"
              debug
              edgeRoundness={2}
              length={80}
              direction="up"
            />
          </td>
          <td>
            Values below <code>0</code> and above <code>1</code> may result in
            other interesting shapes. Pictured: <code>2</code>.
          </td>
        </tr>
      </table>{" "}
      <p>
        Cannot be used together with <code>cornerRadius</code>.
      </p>
    </>
  );
};
