import { useColorMode } from "@docusaurus/theme-common";
import React from "react";
import { BlueButton } from "../layout/Button";
import { Spacer } from "../layout/Spacer";
import { VideoApps } from "./VideoApps";

const panel: React.CSSProperties = {
  backgroundColor: "var(--ifm-background-color)",
  boxShadow: "var(--box-shadow)",
  padding: 10,
  borderRadius: 15,
  flex: 1,
  paddingTop: 30,
  paddingBottom: 10,
  minHeight: 500,
  display: "flex",
  flexDirection: "column",
};

const center: React.CSSProperties = {
  textAlign: "center",
};

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
};

const flex: React.CSSProperties = {
  flex: 1,
};

const step: React.CSSProperties = {
  flex: 1,
  ...panel,
};

const list: React.CSSProperties = {
  listStyleType: "none",
  textAlign: "center",
  paddingLeft: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontWeight: 500,
};

const hr: React.CSSProperties = {
  width: 20,
  textAlign: "center",
  borderTop: 0,
  marginTop: 10,
  marginBottom: 10,
};

const stepTitle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "1.6em",
  marginBottom: 0,
  color: "var(--ifm-color-primary)",
};

const docsButton: React.CSSProperties = {
  textDecoration: "none",
};

export const BuildApps: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <div>
      <h1 style={center}>
        Build video{" "}
        <span
          style={{
            color: "var(--ifm-color-primary)",
          }}
        >
          apps
        </span>
      </h1>
      <p style={{ textAlign: "center" }}>
        Combine our tools to build apps that leverage programmatic video.
      </p>
      <br />
      <VideoApps />
      <br />
      <p style={center}>
        All Remotion products are source-available, for self-hosting, free for
        individuals and small businesses, with company licensing available.
      </p>
    </div>
  );
};
