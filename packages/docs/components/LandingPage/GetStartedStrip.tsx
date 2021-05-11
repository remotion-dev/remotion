import React, { useState } from "react";
import { BlueButton } from "../layout/Button";
import styles from "./get-started.module.css";
import { GithubButton } from "./GithubButton";

export const GetStarted: React.FC = () => {
  const [clicked, setClicked] = useState<number | null>(null);
  return (
    <>
      <div className={styles.myrow}>
        <div style={{ position: "relative" }}>
          {clicked ? (
            <div className={styles.copied} key={clicked}>
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
        </div>
        <div style={{ width: 10 }}></div>
        <a className={styles.a} href="/docs">
          <BlueButton size="sm" loading={false} fullWidth={false}>
            Docs
          </BlueButton>
        </a>
        <div style={{ width: 10 }}></div>
        <a className={styles.a} href="https://github.com/JonnyBurger/remotion">
          <BlueButton size="sm" loading={false} fullWidth={false}>
            <GithubButton></GithubButton>
          </BlueButton>
        </a>
      </div>
      <div style={{ height: 10 }}></div>
    </>
  );
};
