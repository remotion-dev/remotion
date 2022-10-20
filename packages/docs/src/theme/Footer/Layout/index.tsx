import clsx from "clsx";
import React from "react";

export default ({ style, links }) => {
  return (
    <footer
      className={clsx("footer", {
        "footer--dark": style === "dark",
      })}
      style={{
        backgroundColor: "var(--footer-background)",
        borderTop: "var(--footer-border)",
      }}
    >
      <div className="container container-fluid">{links}</div>
    </footer>
  );
};
