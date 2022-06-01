import React from "react";

export const AngleChangelog: React.FC = () => {
  return (
    <details style={{ fontSize: "0.9em", marginBottom: "1em" }}>
      <summary>Changelog</summary>
      <ul>
        <li>
          From Remotion v2.6.7 until v3.0.7, the default for Remotion Lambda was{" "}
          <code>swiftshader</code>, but from v3.0.8 the default is{" "}
          <code>swangle</code> (Swiftshader on Angle) since Chrome 101 added
          support for it.
        </li>
        <li>
          From Remotion v2.4.3 until v2.6.6, the default was <code>angle</code>,
          however it turns out to have a small memory leak that could crash long
          Remotion renders.
        </li>
      </ul>
    </details>
  );
};
