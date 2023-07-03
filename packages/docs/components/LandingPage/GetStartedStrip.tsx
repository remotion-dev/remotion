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
              navigator.clipboard.writeText("npm init video");

              setClicked(Date.now());
            }}
            title="Click to copy"
          >
            $ npm init video
          </div>
          <div style={{ width: 10 }} />
          <a className={styles.a} href="/4" target="_blank">
            <PlainButton size="sm" loading={false} fullWidth={false}>
              Watch the keynote
            </PlainButton>
          </a>
        </div>
      </div>
    </div>
  );
};
