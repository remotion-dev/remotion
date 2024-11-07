import React from "react";
import styles from "./toc.module.css";

export const Grid: React.FC<{
  readonly children: React.ReactNode;
}> = ({ children }) => {
  return <div className={styles.containerrow}>{children}</div>;
};
