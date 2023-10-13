import React from "react";
import styles from "./playerpreview.module.css";

const rotate: React.CSSProperties = {
  transform: `rotate(90deg)`,
};
const ICON_SIZE = 18;
export const PlayerPreview: React.FC = () => {
  return (
    <a href="https://www.youtube.com/watch?v=GN2jkJphR5M" target="_blank">
      <div className={styles.playerpreview}>
        <img
          style={{
            boxShadow: "var(--box-shadow)",
            borderRadius: 12,
          }}
          src="/img/lambda-og.png"
        />
        <div
          style={{
            width: "100%",
            textAlign: "center",
            color: "black",
            fontSize: 13,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox="-100 -100 400 400"
            style={rotate}
          >
            <path
              fill={"var(--ifm-color-primary)"}
              stroke={"var(--ifm-color-primary)"}
              strokeWidth="100"
              strokeLinejoin="round"
              d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
            />
          </svg>
          <div
            style={{
              marginLeft: 5,
              color: "var(--ifm-color-primary)",
            }}
          >
            Watch Promo video (1:20)
          </div>
        </div>
      </div>
    </a>
  );
};
