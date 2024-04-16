import React from "react";
import { PricingBulletPoint } from "./PricingBulletPoint";
import styles from "./pricing.module.css";

export const FreePricing: React.FC = () => {
  return (
    <div className={styles.pricingcontainer}>
      <div className={styles.audience}>
        For individuals and companies of up to 3 people
      </div>
      <h2 className={styles.pricingtitle}>Free License</h2>
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
