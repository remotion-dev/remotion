import React from "react";
import { Button } from "../layout/Button";
import styles from "./footer.module.css";

const container: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0B84F3",
  color: "white",
};

const half: React.CSSProperties = {
  display: "flex",
  flex: 1,
  flexDirection: "row",
};

const inner: React.CSSProperties = {
  textAlign: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  paddingTop: 40,
  paddingBottom: 40,
  flex: 1,
};

export const PlayerPageFooter: React.FC = () => {
  return (
    <div className={styles.footerrow} style={container}>
      <div
        style={{
          ...half,
          justifyContent: "flex-end",
        }}
      >
        <div style={inner}>
          <h2 className={styles.title}>New to Remotion?</h2>
          <p>Learn about how to make videos in React.</p>
          <a href="/" style={{ textDecoration: "none" }}>
            <Button
              background="white"
              hoverColor="white"
              color="#0B84F3"
              loading={false}
              fullWidth={false}
              size="sm"
            >
              Learn Remotion
            </Button>
          </a>
        </div>
      </div>
      <div style={{ ...half, backgroundColor: "#0B84F3" }}>
        <div style={inner}>
          <h2
            className={styles.title}
            style={{
              color: "white",
            }}
          >
            Already used Remotion?
          </h2>
          <p style={{ color: "white" }}>Let{"'"}s get setup with the Player.</p>
          <a href="/docs/player" style={{ textDecoration: "none" }}>
            <Button
              background="white"
              hoverColor="white"
              color="#0B84F3"
              loading={false}
              fullWidth={false}
              size="sm"
            >
              Installation
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
