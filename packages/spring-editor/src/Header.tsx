import React from "react";
import { Img } from "remotion";

export const Header: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        fontFamily: "GTPlanar",
        fontWeight: "bold",
        width: "100%",
        height: 60,
        borderBottom: "1px solid #242424",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 18,
      }}
    >
      <div style={{ fontSize: 20 }}>Spring Editor</div>
      <div style={{ flex: 1 }} />
      <a href="https://remotion.dev" target="_blank">
        <Img
          style={{ height: 60 }}
          // eslint-disable-next-line @remotion/no-string-assets
          src="/remotion.png"
        />
      </a>
    </div>
  );
};
