import React from "react";
import styles from "./features.module.css";

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  paddingTop: 40,
  paddingBottom: 40,
};

const half: React.CSSProperties = {
  flex: 1,
};

export const PlayerFeatures: React.FC = () => {
  return (
    <div className={styles.container}>
      <div style={row}>
        <div style={half}>
          <h2 className={styles.title}>
            <span className={styles.keyword}>Reactive</span> to data
          </h2>
          <p>
            Connect the video to an API or a form - the video will update
            immediately once the data changes - simply update a React prop!
          </p>
        </div>
        <div style={{ width: 20 }} />
        <div style={half} />
      </div>
      <div style={row}>
        <div style={half}>
          <h2 className={styles.title}>
            Extremely <span className={styles.keyword}>customizable</span>
          </h2>
          <p>
            The Remotion Player is inspired by the browsers native{" "}
            <code>&lt;video&gt;</code> tag. Get started by adding the{" "}
            <code>controls</code> prop, or build your own UI using our flexible
            APIs.{" "}
          </p>
        </div>
        <div style={{ width: 20 }} />
        <div style={half} />
      </div>
      <div style={row}>
        <div style={half}>
          <h2 className={styles.title}>
            Turn it into <span className={styles.keyword}>real videos</span>
          </h2>
          <p>
            Connect to the Remotion server-side rendering APIs to turn the
            preview into real videos. We have support for audio and various
            codecs, and allow rendering in Node.JS or serverless (coming soon).
          </p>
        </div>
        <div style={{ width: 20 }} />
        <div style={half} />
      </div>
    </div>
  );
};
