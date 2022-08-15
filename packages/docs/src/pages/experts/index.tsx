import Layout from "@theme/Layout";
import React from "react";
import { experts } from "./data";
import styles from "./experts.module.css";

const Experts: React.FC = () => {
  return (
    <Layout>
      <div className={styles.wrapper}>
        <h1>Hire Remotion freelancers</h1>
        <p>
          These people have indicated that they are available to work on
          Remotion projects. They appear in random order.{" "}
        </p>
        <p>
          <a href="mailto:hi@remotion.dev?subject=Remotion+experts+directory">
            Are you available for hire? Let us know!
          </a>
        </p>
        {experts.map((e) => {
          return (
            <div key={e.name} className={styles.card}>
              <img className={styles.profile} src={e.image} />
              <div className={styles.spacer} />
              <div>
                <div className={styles.title}>{e.name}</div>
                <p>{e.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default Experts;
