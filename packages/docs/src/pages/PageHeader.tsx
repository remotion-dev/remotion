import React from "react";
import styles from "./header.module.css";

export const PageHeader: React.FC = () => {
  return (
    <div className={styles.row}>
      <div style={{ flex: 1 }}>
        <h1 className={styles.title}>Write videos programmatically in React</h1>
        <p>
          Use your React knowledge to create real MP4 videos. Render videos
          dynamically using server-side rendering and parametrization.
        </p>
      </div>
      <iframe
        style={{
          width: 560,
          height: 315,
          maxWidth: "100%",
        }}
        src="https://www.youtube.com/embed/gwlDorikqgY"
        title="Remotion - Create videos programmatically in React"
        frameBorder="0"
        allow="autoplay"
        allowFullScreen
      />
    </div>
  );
};
