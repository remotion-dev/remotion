import React, { useState } from "react";
import { useMobileLayout } from "../../src/helpers/mobile-layout";
import { BlueButton } from "../layout/Button";
import styles from "./get-started.module.css";
import { GithubButton } from "./GithubButton";

export const GetStarted: React.FC = () => {
  const [clicked, setClicked] = useState<number | null>(null);
  const mobileLayout = useMobileLayout();

  return (
    <div
      className={styles.myrow}
      style={{
        flexDirection: mobileLayout ? "column" : "row",
      }}
    >
      <div style={{ position: "relative" }}>
        <div className={styles.partialrow}>
          {clicked ? (
            <div key={clicked} className={styles.copied}>
              Copied!
            </div>
          ) : null}
          <div
            className={styles.codeblock}
            onClick={() => {
              navigator.clipboard.writeText("npm init video");

              setClicked(Date.now());
            }}
            title="Click to copy"
          >
            $ npm init video
          </div>
          <div style={{ width: 10 }} />
          <a className={styles.a} href="/docs">
            <BlueButton size="sm" loading={false} fullWidth={false}>
              Docs
            </BlueButton>
          </a>
        </div>
      </div>
      <div style={{ width: 10, height: 10 }} />
      <div className={styles.partialrow}>
        <a
          className={styles.a}
          href="https://www.youtube.com/watch?v=deg8bOoziaE"
        >
          <BlueButton size="sm" loading={false} fullWidth={false}>
            Watch demo
          </BlueButton>
        </a>
        <div style={{ width: 10 }} />
        <a className={styles.a} href="/docs">
          <BlueButton size="sm" loading={false} fullWidth={false}>
            Discord
          </BlueButton>
        </a>
        <div style={{ width: 10 }} />
        <a className={styles.a} href="https://github.com/remotion-dev/remotion">
          <BlueButton size="sm" loading={false} fullWidth={false}>
            <GithubButton />
          </BlueButton>
        </a>
      </div>
    </div>
  );
};
