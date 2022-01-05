import React from "react";
import { Button } from "../layout/Button";
import styles from "./powered.module.css";

export const PoweredByRemotion: React.FC = () => {
  return (
    <div style={{ background: "#0B84F3" }}>
      <div
        className={styles.responsiverow}
        style={{
          maxWidth: 1000,
          paddingLeft: 16,
          paddingRight: 16,
          margin: "auto",
          paddingTop: 30,
          paddingBottom: 30,
          color: `#fff`,
          display: "flex",
        }}
      >
        <div>
          <p style={{ marginBottom: 8 }}>
            <strong>Powered by Remotion</strong>
          </p>
          <p style={{ marginBottom: 0 }}>
            Remotion is the premier framework for writing videos in React.
            <br />
            Use the timeline editor with Fast Refresh to get every frame
            perfect, before you embed it in a website.
          </p>
        </div>
        <div className={styles.flexer} />
        <div>
          <a href="/" style={{ textDecoration: "none" }}>
            <Button
              background="white"
              hoverColor="white"
              color="#0B84F3"
              loading={false}
              fullWidth={false}
              size="sm"
            >
              Learn more
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
