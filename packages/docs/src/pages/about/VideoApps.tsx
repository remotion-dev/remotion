import { useColorMode } from "@docusaurus/theme-common";
import React from "react";
import { BlueButton } from "./Button";
import { Spacer } from "./Spacer";
import videoapps from "./videoapps.module.css";
import { YouAreHere } from "./YouAreHere";
import Jonny from "./Jonny Burger.png";
import Mehmet from "./Mehmet Ademi.png";
import Patric from "./Patric Salvisberg.png";

const panel: React.CSSProperties = {
  backgroundColor: "var(--ifm-background-color)",
  boxShadow: "var(--box-shadow)",
  padding: 10,
  borderRadius: 15,
  flex: 1,
  paddingTop: 30,
  paddingBottom: 10,
  minHeight: 550,
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

const DiscordLogo: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 512"
      style={{
        width: 54,
        marginRight: 1,
      }}
    >
      <path
        fill="var(--blue-button-color)"
        d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"
      />
    </svg>
  );
};

export const VideoApps: React.FC<{
  active: "remotion" | "player" | "lambda";
}> = ({ active }) => {
  const { colorMode } = useColorMode();
  return (
    <div className={videoapps.row}>
      <div style={step}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <img
            src={Jonny}
            style={{
              width: 250,
              height: 250,
              boxShadow: "var(--box-shadow)",
              borderRadius: 1500,
            }}
          />
        </div>
        <h2 style={stepTitle}>Jonny</h2>
        <strong style={center}>Chief Hacker</strong>

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
                <a href="https://twitter.com/JNYBGR">
                  <BlueButton loading={false} fullWidth size="sm">
                    Twitter
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <img
            src={Mehmet}
            style={{
              width: 250,
              height: 250,
              boxShadow: "var(--box-shadow)",
              borderRadius: 1500,
            }}
          />
        </div>
        <h2 style={stepTitle}>Mehmet</h2>
        <strong style={center}>Business Manager</strong>
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <img
            src={Patric}
            style={{
              width: 250,
              height: 250,
              boxShadow: "var(--box-shadow)",
              borderRadius: 1500,
            }}
          />
        </div>
        <h2 style={stepTitle}>Patric</h2>
        <strong style={center}>Intern</strong>

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
