import React from "react";
import styles from "./playerpreview.module.css";

export const PlayerPreview: React.FC = () => {
  return (
    <a
      href="https://www.youtube.com/watch?v=gwlDorikqgY"
      target="_blank"
      data-splitbee-event="External Link"
      data-splitbee-event-target={"YouTube Trailer"}
    >
      <div className={styles.playerpreview}>
        <img
          style={{
            boxShadow: "var(--box-shadow)",
          }}
          src="http://i3.ytimg.com/vi/gwlDorikqgY/maxresdefault.jpg"
        ></img>
        <div
          style={{
            width: "100%",
            textAlign: "center",
            position: "absolute",
            bottom: 20,
            color: "black",
            fontSize: 13,
          }}
        >
          Watch 2 min video
        </div>
      </div>
    </a>
  );
};
