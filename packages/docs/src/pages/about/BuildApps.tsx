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
      <p style={{ textAlign: "center" }}>
        Combine our tools to build apps that leverage programmatic video.
      </p>

      <VideoApps active="lambda" />
      <br />
      <br />

      <p style={center}>
        All Remotion products are source-available, for self-hosting, free for
        individuals and small businesses, with company licensing available.
      </p>
    </div>
  );
};
