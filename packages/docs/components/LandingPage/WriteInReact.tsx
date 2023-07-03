import React from "react";
import { ChooseTemplate } from "../../src/components/ChooseTemplate";
import { GetStarted } from "./GetStartedStrip";
import styles from "./writeinreact.module.css";

export const WriteInReact: React.FC = () => {
  return (
    <div>
      <h1 className={styles.writeincsstitle}>Make videos programmatically</h1>
      <br />
      <p
        style={{
          textAlign: "center",
          fontSize: "1.2em",
          fontWeight: 500,
        }}
        className={styles.text}
      >
        and much more using React.
        <br />
        Catch the Remotion 4.0 release today live.
      </p>
      <br />
      <div className={styles.writeincss}>
        <GetStarted />
      </div>
      <br />
      <br />
      <div>
        <ChooseTemplate />
      </div>
    </div>
  );
};
