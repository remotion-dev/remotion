import React from "react";
import { Button } from "../layout/Button";
import styles from "./powered.module.css";

export const WrappedBanner: React.FC = () => {
  return (
    <div style={{ background: `#FFE3CA` }}>
      <div
        className={styles.responsiverow}
        style={{
          maxWidth: 1000,
          paddingLeft: 16,
          paddingRight: 16,
          margin: "auto",
          paddingTop: 30,
          paddingBottom: 30,
          color: `black`,
          display: "flex",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <p style={{ marginBottom: 8 }}>
            <strong>Reference application</strong>
          </p>
          <p style={{ marginBottom: 0 }}>
            Check out #GitHubUnwrapped to get your personal GitHub Year in
            Review. <br /> Powered by Remotion Player and open source!
          </p>
        </div>
        <div className={styles.flexer} />
        <div>
          <a
            href="https://githubunwrapped.com"
            target="_blank"
            style={{ textDecoration: "none" }}
          >
            <Button
              background="white"
              hoverColor="white"
              color="#000"
              loading={false}
              fullWidth={false}
              size="sm"
            >
              Visit GitHubUnwrapped.com
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
