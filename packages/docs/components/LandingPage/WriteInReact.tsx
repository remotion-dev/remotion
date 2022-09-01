import React from "react";
import { ChooseTemplate } from "../../src/components/ChooseTemplate";
import { GetStarted } from "./GetStartedStrip";
import styles from "./writeinreact.module.css";

export const WriteInReact: React.FC = () => {
  return (
    <div>
      <h1 className={styles.writeincsstitle}>Write videos in React.</h1>
      <br />
      <p
        style={{
          textAlign: "center",
          fontSize: "1.2em",
          fontWeight: 500,
        }}
        className={styles.text}
      >
        Create real MP4 videos programmatically. <br /> Scale your video
        production using server-side rendering and parametrization.
      </p>
      <br />
      <div className={styles.writeincss}>
        <GetStarted />
      </div>
      <br />
      <div>
        <ChooseTemplate />
      </div>
    </div>
  );
};
