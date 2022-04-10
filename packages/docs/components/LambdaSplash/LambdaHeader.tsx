import React from "react";
import { PlayerPreview } from "./PlayerPreview";
import styles from "./lambdaheader.module.css";
import { BlueButton } from "../layout/Button";

export const LambdaHeader: React.FC = () => {
  return (
    <div className={styles.writeincss}>
      <div style={{ flex: 1 }}>
        <h1 className={styles.writeincsstitle}>
          Rendering. <br /> At scale.
        </h1>
        <p>
          Distribute render workload over multiple Lambdas and only pay for when
          you are rendering. Slash render times into a fraction of what you are
          used to.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <a className={styles.a} href="/docs/lambda">
            <BlueButton size="sm" loading={false} fullWidth={false}>
              Read documentation
            </BlueButton>
          </a>
          <div
            style={{
              width: 10,
            }}
          />
          <a className={styles.a} href="https://discord.gg/6VzzNDwUwV">
            <BlueButton size="sm" loading={false} fullWidth={false}>
              Join Discord
            </BlueButton>
          </a>
        </div>
      </div>
      <div className={styles.spacer} />
      <div className={styles.writeright}>
        <PlayerPreview />
      </div>
    </div>
  );
};
