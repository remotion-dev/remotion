import React from "react";
import { GetStarted } from "./GetStartedStrip";
import { PlayerPreview } from "./PlayerPreview";
import styles from "./writeinreact.module.css";

export const WriteInReact: React.FC = () => {
  return (
    <div className={styles.writeincss}>
      <div style={{ flex: 1 }}>
        <h1 className={styles.writeincsstitle}>
          Write videos <br /> in React.
        </h1>
        <p>
          Use your React knowledge to create real MP4 videos. <br /> Scale your
          video production using server-side rendering and parametrization.
        </p>

        <GetStarted />
      </div>
      <div className={styles.writeright}>
        <PlayerPreview />
      </div>
    </div>
  );
};
