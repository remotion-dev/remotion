import { useColorMode } from "@docusaurus/theme-common";
import React from "react";
import { BlueButton } from "../layout/Button";
import { Spacer } from "../layout/Spacer";
import videoapps from "./videoapps.module.css";
import { YouAreHere } from "./YouAreHere";

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

export const VideoApps: React.FC<{
  active: "remotion" | "player" | "lambda";
}> = ({ active }) => {
  const { colorMode } = useColorMode();
  return (
    <div className={videoapps.row}>
      <div style={step}>
        {active === "remotion" ? <YouAreHere /> : null}
        <h2 style={stepTitle}>Remotion</h2>
        <strong style={center}>Make videos programmatically</strong>
        <br />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <img src="/img/writeinreact.png" />
        </div>
        <ul style={list}>
          <li>Use the Web to create graphics</li>
          <hr style={hr} />
          <li>Consume user input and APIs</li>
          <hr style={hr} />
          <li>Render real MP4 videos</li>
        </ul>
        <div style={row}>
          {active === "remotion" ? null : (
            <>
              <div style={flex}>
                <a style={docsButton} href="/">
                  <BlueButton loading={false} fullWidth size="sm">
                    Learn more
                  </BlueButton>
                </a>
              </div>
              <Spacer />
              <Spacer />
            </>
          )}
          <div style={flex}>
            <a style={docsButton} href="/docs">
              <BlueButton loading={false} fullWidth size="sm">
                Read docs
              </BlueButton>
            </a>
          </div>
        </div>
      </div>
      <Spacer />
      <Spacer />
      <Spacer />
      <div style={step}>
        {active === "player" ? <YouAreHere /> : null}
        <h2 style={stepTitle}>Remotion Player</h2>
        <strong style={center}>Embeddable interactive videos</strong>
        <br />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <img
            src={
              colorMode === "dark"
                ? "/img/player-example-dark.png"
                : "/img/player-example.png"
            }
          />
        </div>
        <ul style={list}>
          <li>Preview videos in the browser</li>
          <hr style={hr} />
          <li>React to user input</li>
          <hr style={hr} />
          <li>Customize look and behavior</li>
        </ul>
        <div style={row}>
          {active === "player" ? null : (
            <>
              <div style={flex}>
                <a style={docsButton} href="/player">
                  <BlueButton loading={false} fullWidth size="sm">
                    Learn more
                  </BlueButton>
                </a>
              </div>
              <Spacer />
              <Spacer />
            </>
          )}
          <div style={flex}>
            <a style={docsButton} href="/docs/player">
              <BlueButton loading={false} fullWidth size="sm">
                Read docs
              </BlueButton>
            </a>
          </div>
        </div>
      </div>
      <Spacer />
      <Spacer />
      <Spacer />
      <div style={step}>
        {active === "lambda" ? <YouAreHere /> : null}
        <h2 style={stepTitle}>Remotion Lambda</h2>
        <strong style={center}>Render at scale</strong>
        <br />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <img
            src={
              colorMode === "dark"
                ? "/img/cluster-dark.png"
                : "/img/cluster.png"
            }
          />
        </div>

        <ul style={list}>
          <li>Render videos in the cloud</li>
          <hr style={hr} />
          <li>Scale according to your volume</li>
          <hr style={hr} />
          <li>Fast because distributed</li>
        </ul>
        <div style={row}>
          {active === "lambda" ? null : (
            <>
              <div style={flex}>
                <a style={docsButton} href="/lambda">
                  <BlueButton loading={false} fullWidth size="sm">
                    Learn more
                  </BlueButton>
                </a>
              </div>
              <Spacer />
              <Spacer />
            </>
          )}
          <div style={flex}>
            <a style={docsButton} href="/docs/lambda">
              <BlueButton loading={false} fullWidth size="sm">
                Read docs
              </BlueButton>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
