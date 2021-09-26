import React from "react";

export const Prerelease: React.FC = () => {
  const version =
    new URLSearchParams(window.location.search)?.get("version") ??
    "2.4.0-alpha.b886f9bc";
  return (
    <div>
      <p>
        If you have received a prerelease version of Remotion, such as
        <code>{version}</code>, this is how you install it:
      </p>
      <p>
        Replace all packages that are part of Remotion, such as{" "}
        <code>remotion</code>, <code>@remotion/renderer</code>,
        <code>@remotion/lambda</code>, etc with the version that you have
        received:
      </p>
      <pre className="code-container">
        {["@remotion/bundler", "@remotion/renderer", "remotion"].map((r) => {
          return (
            <div key={r}>
              <span style={{ color: "#e13238" }}>
                - &quot;{r}&quot;: &quot;{version}&quot;
              </span>
              {"\n"}
              <span style={{ color: "#009400" }}>
                + &quot;{r}&quot;: &quot;{version}&quot;
              </span>
              {"\n"}
            </div>
          );
        })}
      </pre>
    </div>
  );
};
