import React from "react";
import styles from "./pricing.module.css";
import { PricingTable } from "./PricingTable";

export const FreePricing: React.FC = () => {
  return (
    <>
      <div className={styles.pricingcontainer}>
        <h2 className={styles.pricingtitle}>
          <span className={styles.mp4}>Free</span> for individuals <br /> Funded
          by companies
        </h2>
        <p>
          Remotion is free for individuals - you can even build a business on
          it! <br />
          As a company, you need a license to use Remotion. <br /> With your
          support, we constantly improve Remotion for everyone.
        </p>
      </div>
      <PricingTable />
      <br />
      <br />
      <br />
    </>
  );
};
