import React from "react";
import styles from "./fast.module.css";

export const LambdaFast: React.FC = () => {
  return (
    <div className={styles.row}>
      <div className={styles.tile}>
        <img
          src="/img/mp4.png"
          style={{
            width: 110,
          }}
        />
      </div>
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
