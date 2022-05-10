import React, { useMemo } from "react";

export const TemplateModalContent: React.FC = () => {
  const containerCss: React.CSSProperties = useMemo(() => {
    return {
      backgroundColor: "var(--ifm-hero-background-color)",
      marginBottom: 0,
      display: "flex",
      flexDirection: "row",
      overflow: "auto",
      width: 100,
      height: 100,
    };
  }, []);

  return <div style={containerCss}></div>;
};
