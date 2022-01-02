import useThemeContext from "@theme/hooks/useThemeContext";
import React from "react";
import styles from "./features.module.css";

const half: React.CSSProperties = {
  flex: 1,
};

export const PlayerFeatures: React.FC = () => {
  const { isDarkTheme } = useThemeContext();

  return (
    <div className={styles.container}>
      <div className={styles.row}>
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
        <div style={half}>
          <video
            src={isDarkTheme ? "/img/reactive-dark.mp4" : "/img/reactive.mp4"}
            playsInline
            muted
            autoPlay
            loop
          />
        </div>
      </div>
      <div className={styles.row}>
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
        <div style={half}>
          <video
            src={
              isDarkTheme
                ? "/img/customizable-dark.mp4"
                : "/img/customizable-light.mp4"
            }
            playsInline
            muted
            autoPlay
            loop
          />
        </div>
      </div>
      <div className={styles.row}>
        <div style={half}>
          <h2 className={styles.title}>
            Turn it into real <span className={styles.keyword}> videos</span>
          </h2>
          <p>
            Connect to the Remotion server-side rendering APIs to turn the
            preview into real videos. We have support for audio and various
            codecs, and allow rendering in Node.JS or serverless (coming soon).
          </p>
        </div>
        <div style={{ width: 20 }} />
        <div style={half}>
          <video
            src={
              isDarkTheme ? "/img/pipeline-dark.mp4" : "/img/pipeline-light.mp4"
            }
            playsInline
            muted
            autoPlay
            loop
          />
        </div>
      </div>
    </div>
  );
};
