import React from "react";

export const AngleChangelog: React.FC = () => {
  return (
    <details style={{ fontSize: "0.9em", marginBottom: "1em" }}>
      <summary>Changelog</summary>
      From Remotion v2.4.3 until v2.6.6, the default was <code>angle</code>,
      however it turns out to have a memory leak.
    </details>
  );
};
