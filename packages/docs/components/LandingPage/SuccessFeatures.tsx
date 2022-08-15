import React from "react";
import { BlueButton } from "../layout/Button";
import styles from "./success.module.css";

const container: React.CSSProperties = {
  maxWidth: 400,
};

const card: React.CSSProperties = {
  backgroundColor: "var(--ifm-background-color)",
  boxShadow: "var(--box-shadow)",
  borderRadius: 15,
  overflow: "hidden",
};

const padding: React.CSSProperties = {
  padding: 16,
};

const p: React.CSSProperties = {
  marginTop: 4,
  marginBottom: 8,
};

const titleCard: React.CSSProperties = {
  height: 160,
  backgroundSize: "cover",
  backgroundPosition: "center center",
  backgroundImage: "url(/img/makestoriescard.png)",
};

export const SuccessFeatures: React.FC = () => {
  return (
    <div>
      <p>
        <strong>Featured story</strong>
      </p>
      <a className={styles.successlink} href="/success-stories/makestories">
        <div style={container}>
          <div style={card}>
            <div style={titleCard} />
            <div style={padding}>
              <h3 style={{ marginBottom: 0 }}>
                How MakeStories leverages Remotion to render Web Stories
              </h3>
              <p style={p}>Interview with Pratik Ghela, Founder</p>
              <br />
              <br />
              <BlueButton fullWidth loading={false} size="sm">
                Read success story
              </BlueButton>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};
