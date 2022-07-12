import React from "react";
import styles from "./AboutUsHeader.module.css";

export const AboutUsHeader: React.FC = () => {
  return (
    <div className={styles.writeincss}>
      <div style={{ flex: 1 }}>
        <h1 className={styles.writeincsstitle}>
          Remotion. The programmatic video dream.
        </h1>
        <p>
          Remotion is from developers for developers. While the company was
          founded in 2022, the idea of programmatic videos in React was born a
          year before. Remotion combines qualities of programming and essential
          features of traditional video editing programs. Our software is
          source-available, meaning everyone can look at our code and
          contribute. This allowed us to create a community of hundreds of
          developers to fulfill the programmatic video dream. Remotion is free
          for individuals and small teams, bigger companies will have to acquire
          a company license to use Remotion.
        </p>
      </div>
    </div>
  );
};
