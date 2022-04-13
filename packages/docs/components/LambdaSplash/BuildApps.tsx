import React from "react";
import { Spacer } from "../layout/Spacer";

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

const step: React.CSSProperties = {
  flex: 1,
  ...panel,
};

const stepTitle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "1.3em",
};

export const BuildApps: React.FC = () => {
  return (
    <div>
      <h1 style={center}>Build Video Apps</h1>
      <br />
      <div style={row}>
        <div style={step}>
          <h2 style={stepTitle}>Remotion</h2>
          Write videos in React.
          <ul>
            <li>Use the Web to create graphics</li>
            <li>Consume user input and APIs</li>
            <li>Render real MP4 videos</li>
          </ul>
        </div>
        <Spacer />
        <Spacer />
        <Spacer />
        <div style={step}>
          <h2 style={stepTitle}>Remotion Player</h2>
          Embeddable interactive videos
          <ul>
            <li>Preview videos in the browser</li>
            <li>React to user input</li>
          </ul>
        </div>
        <Spacer />
        <Spacer />
        <Spacer />
        <div style={step}>
          <h2 style={stepTitle}>Remotion Lambda</h2>
          Render at scale
          <ul>
            <li>Render videos in the cloud</li>
          </ul>
        </div>
      </div>
      <br />
      <p style={center}>
        All Remotion products are source-available, for self-hosting, free for
        individuals and small businesses, with company licensing available.
      </p>
    </div>
  );
};
