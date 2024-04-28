import React, { useState } from "react";
import { useMobileLayout } from "../../src/helpers/mobile-layout";
import { PlainButton } from "../layout/Button";
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
              navigator.clipboard.writeText("npx create-video@latest");

              setClicked(Date.now());
            }}
            title="Click to copy"
          >
            $ npx create-video@latest
          </div>
          <div style={{ width: 10 }} />
          <a
            className={styles.a}
            href="https://www.youtube.com/watch?v=deg8bOoziaE"
            target="_blank"
          >
            <PlainButton size="sm" loading={false} fullWidth={false}>
              Watch demo
            </PlainButton>
          </a>
        </div>
      </div>
      <div style={{ width: 10, height: 10 }} />
      <div style={{ position: "relative" }}>
        <div className={styles.partialrow}>
          <a className={styles.a} href="/docs">
            <PlainButton size="sm" loading={false} fullWidth={false}>
              Docs
            </PlainButton>
          </a>
          <div style={{ width: 10 }} />
          <a
            className={styles.a}
            href="https://remotion.dev/discord"
            target="_blank"
          >
            <PlainButton size="sm" loading={false} fullWidth={false}>
              Discord
            </PlainButton>
          </a>
          <div style={{ width: 10 }} />
          <a
            className={styles.a}
            href="https://github.com/remotion-dev/remotion"
            target="_blank"
          >
            <PlainButton size="sm" loading={false} fullWidth={false}>
              <GithubButton />
            </PlainButton>
          </a>
        </div>
      </div>
    </div>
  );
};
