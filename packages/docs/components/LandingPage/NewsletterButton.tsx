import React from "react";
import { BlueButton } from "../layout/Button";
import styles from "./newsletter.module.css";

export const NewsletterButton: React.FC<{}> = () => {
  return (
    <div>
      <div className={styles.pricingrow}>
        <div className={styles.portion}>
          <div className={styles.panel}>
            <div
              className={[styles.tablenewsletter, styles.titlecolor].join(" ")}
            >
              Remotion Newsletter
            </div>
            <ul>
              <li>
                In our newsletter, we announce and summarize every once in a
                while new features and all noteworthy updates we have made on
                Remotion. Stay in the loop and join our newsletter.
              </li>
            </ul>
            <div style={{ flex: 1 }} />
            <a
              className={styles.newslettera}
              href="https://www.getrevue.co/profile/Remotion?via=twitter-profile"
              target="_blank"
            >
              <div>
                <BlueButton fullWidth loading={false} size="bg">
                  Subscribe
                </BlueButton>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
