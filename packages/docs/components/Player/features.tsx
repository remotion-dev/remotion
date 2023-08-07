import { useColorMode } from "@docusaurus/theme-common";
import React, { useState } from "react";
import { ColorPicker, colorPickerColors } from "../Player/ColorPicker";
import { PlayerExample } from "../PlayerExample";
import { CoolInput } from "../TextInput";
import styles from "./features.module.css";

export const PlayerFeatures: React.FC = () => {
  const { colorMode } = useColorMode();
  const [name, setName] = useState("");
  const [color, setColor] = useState(colorPickerColors[0]);

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.half}>
          <h2 className={styles.title}>Demo</h2>
          <p>Enter a name and pick a color and watch the video adapt.</p>
          <CoolInput
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <ColorPicker selected={color} onSelected={setColor} />
        </div>
        <div style={{ width: 20, height: 30 }} />
        <div className={styles.half}>
          <PlayerExample name={name} color={color} autoPlayOnFocus />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.half}>
          <h2 className={styles.title}>
            <span className={styles.keyword}>Reactive</span> to data
          </h2>
          <p>
            Connect the video to an API or a form - the video will update
            immediately once the data changes - simply update a React prop!
          </p>
        </div>
        <div style={{ width: 20 }} />
        <div className={styles.half}>
          <video
            src={
              colorMode === "dark"
                ? "/img/reactive-dark.mp4"
                : "/img/reactive.mp4"
            }
            playsInline
            muted
            autoPlay
            loop
          />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.half}>
          <h2 className={styles.title}>
            Extremely <span className={styles.keyword}>customizable</span>
          </h2>
          <p>
            The Remotion Player is inspired by the browsers native{" "}
            <code>&lt;video&gt;</code> tag. Get started by adding the{" "}
            <code>controls</code> prop, or build your own UI using our flexible
            APIs.{" "}
          </p>
        </div>
        <div style={{ width: 20 }} />
        <div className={styles.half}>
          <video
            src={
              colorMode === "dark"
                ? "/img/customizable-dark.mp4"
                : "/img/customizable-light.mp4"
            }
            playsInline
            muted
            autoPlay
            loop
          />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.half}>
          <h2 className={styles.title}>
            Turn it into real <span className={styles.keyword}> videos</span>
          </h2>
          <p>
            Connect to the Remotion server-side rendering APIs to turn the
            preview into real videos. We have support for audio and various
            codecs, and allow rendering in Node.JS or AWS Lambda.
          </p>
        </div>
        <div style={{ width: 20 }} />
        <div className={styles.half}>
          <video
            src={
              colorMode === "dark"
                ? "/img/pipeline-dark.mp4"
                : "/img/pipeline-light.mp4"
            }
            playsInline
            muted
            autoPlay
            loop
          />
        </div>
      </div>
    </div>
  );
};
