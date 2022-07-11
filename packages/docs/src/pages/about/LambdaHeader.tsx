import React from "react";
import { PlayerPreview } from "./PlayerPreview";
import styles from "./lambdaheader.module.css";
import { BlueButton } from "./Button";
import { LambdaLogo } from "./LambdaLogo";

export const LambdaHeader: React.FC = () => {
  return (
    <div>
      <div className={styles.writeincss}>
        <div style={{ flex: 1 }}>
          <LambdaLogo />
          <h1 className={styles.writeincsstitle}>
            Remotion. <br /> In Zurich <br />
          </h1>
          <p>Remotion is from developers for developers.</p>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          ></div>
        </div>
        <div className={styles.spacer} />
        <div>
          <div className={styles.spacer} />
          <div className={styles.writeright} />
          <PlayerPreview />
          <br />
          <div className={styles.spacer} />
          <PlayerPreview />
        </div>
      </div>
      <div className={styles.spacer} />
      <PlayerPreview />
    </div>
  );
};
