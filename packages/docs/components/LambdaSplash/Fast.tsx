import { useColorMode } from "@docusaurus/theme-common";
import React from "react";
import { Spacer } from "../layout/Spacer";
import styles from "./fast.module.css";

export const LambdaFast: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <div className={styles.row}>
      <div className={styles.tile}>
        <video
          src={
            colorMode === "dark"
              ? "/img/timelinesplitdark.mp4"
              : "/img/timelinesplitlight.mp4"
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
          Fast because <span className={styles.realgradient}>distributed</span>
        </h2>
        <p>
          Because you write videos declaratively in React, rendering can be
          distributed to many Lambda functions which can each perform work
          independently. The Remotion masterplan has come alive.
        </p>
      </div>
    </div>
  );
};
