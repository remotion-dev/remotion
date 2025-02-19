import { useColorMode } from "@docusaurus/theme-common";
import React from "react";
import { Spacer } from "../layout/Spacer";
import styles from "./easy.module.css";

export const LambdaEasy: React.FC = () => {
  const { colorMode } = useColorMode();

  return (
    <div className={styles.row}>
      <div className={styles.tile}>
        <video
          src={
            colorMode === "dark"
              ? "/img/npminstalldark.mp4"
              : "/img/npminstalllight.mp4"
          }
          loop
          muted
          playsInline
          autoPlay
        />
      </div>
      <Spacer />
      <Spacer />
      <Spacer />
      <div className={styles.tile}>
        <h2 className={styles.title}>
          <span className={styles.realgradient}>Easy</span> to setup.
        </h2>
        <p>
          We{"'"}ve figured out hard problems such as cloud architecture,
          scheduling and progress reporting to provide you with a solution that
          you can deploy to your own account by following a series of
          well-defined steps.
        </p>
      </div>
    </div>
  );
};
