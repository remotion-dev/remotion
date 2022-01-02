import React from "react";
import Layout from "@theme/Layout";
import { LandingHeader } from "../../../components/Player/LandingHeader";
import { PoweredByRemotion } from "../../../components/Player/PoweredByRemotion";

const container: React.CSSProperties = {
  maxWidth: 1000,
  margin: "auto",
  paddingLeft: 16,
  paddingRight: 16,
};

export default () => {
  return (
    <Layout
      title="@remotion/player"
      description="Embed videos that are written in React, and change them at runtime. Connect it to server-side rendering to turn them into real MP4 videos."
    >
      <div style={container}>
        <LandingHeader />
      </div>
      <PoweredByRemotion />
    </Layout>
  );
};
