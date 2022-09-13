import Link from "@docusaurus/Link";
import React from "react";
import styles from "./toc.module.css";

export const TOCItem: React.FC<{
  link: string;
  children: React.ReactNode;
}> = ({ link, children }) => {
  return (
    <Link to={link} className={styles.link}>
      <div className={styles.item}>{children}</div>
    </Link>
  );
};
