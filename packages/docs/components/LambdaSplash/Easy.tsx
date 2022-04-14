import React from "react";
import styles from "./easy.module.css";

export const LambdaEasy: React.FC = () => {
  return (
    <div className={styles.row}>
      <div className={styles.tile}>
        <video
          src="/img/npminstall.mp4"
          style={{}}
          loop
          muted
          playsInline
          autoPlay
        />
      </div>
      <div className={styles.tile}>
        <h2 className={styles.title}>
          <span className={styles.realgradient}>Easy</span> to setup.
        </h2>
        <p>
          We{"'"}ve figured out hard problems such as cloud architecture,
          scheduling and progress reporting and provide you with a solution that
          you can deploy to your own account by following a series of
          well-defined steps.
        </p>
      </div>
    </div>
  );
};
