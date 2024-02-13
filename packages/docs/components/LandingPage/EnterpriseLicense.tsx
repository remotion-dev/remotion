import React from "react";
import styles from "./pricing.module.css";
import { PricingBulletPoint } from "./PricingBulletPoint";

const textUnitWrapper: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

export const EnterpriseLicense: React.FC = () => {
  return (
    <div className={styles.pricingcontainer}>
      <div className={styles.text}>For advanced needs</div>
      <h2 className={styles.pricingtitle}>Enterprise license</h2>
      <PricingBulletPoint text="Custom terms and pricing" checked />
      <PricingBulletPoint text="Remotion fills out compliance forms" checked />
      <PricingBulletPoint text="Prioritized feature requests" checked />
      <PricingBulletPoint text="Private support" checked />
      <div style={{ height: 30 }} />
      <div
        className={styles.rowcontainer}
        style={{ justifyContent: "flex-end" }}
      >
        <div
          style={{
            ...textUnitWrapper,
            alignItems: "flex-end",
          }}
        >
          <div
            className={styles.pricetag}
            style={{
              justifyContent: "flex-end",
              fontSize: 30,
              lineHeight: 1.4,
            }}
          >
            Contact us
          </div>
          <div className={styles.descriptionsmall}>
            Starting at $500 per month
          </div>
        </div>
      </div>
    </div>
  );
};
