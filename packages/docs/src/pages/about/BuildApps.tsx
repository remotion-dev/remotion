import React from "react";
import { VideoApps } from "./VideoApps";

const center: React.CSSProperties = {
  textAlign: "center",
};

export const BuildApps: React.FC = () => {
  return (
    <div>
      <h1 style={center}>
        Remotion{" "}
        <span
          style={{
            color: "var(--ifm-color-primary)",
          }}
        >
          Team
        </span>
      </h1>
      <VideoApps active="lambda" />
    </div>
  );
};
