import React from "react";
import styles from "./pricing.module.css";
import { PricingBulletPoint } from "./PricingBulletPoint";

export const FreePricing: React.FC = () => {
  return (
    <div className={styles.pricingcontainer}>
      <div className={styles.text}>
        For individuals and companies of up to 3
      </div>
      <h2 className={styles.pricingtitle}>Free forever</h2>
      <PricingBulletPoint text="Unlimited videos" checked />
      <PricingBulletPoint text="Commercial use allowed" checked />
      <PricingBulletPoint
        text="Cloud rendering allowed (self-hosted)"
        checked
      />
      <PricingBulletPoint text="Upgrade when your team grows" checked={false} />
    </div>
  );
};
