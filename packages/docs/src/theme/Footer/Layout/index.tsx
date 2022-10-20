import { useColorMode } from "@docusaurus/theme-common";
import clsx from "clsx";
import React from "react";

export default ({ style, links }) => {
  const { isDarkTheme } = useColorMode();
  return (
    <footer
      className={clsx("footer", {
        "footer--dark": style === "dark",
      })}
      style={{
        backgroundColor: isDarkTheme ? "#1f1f1f" : "#fcfcfc",
        borderTop: isDarkTheme ? "1px solid #2f2f2f" : "1px solid #eaeaea",
      }}
    >
      <div className="container container-fluid">{links}</div>
    </footer>
  );
};
