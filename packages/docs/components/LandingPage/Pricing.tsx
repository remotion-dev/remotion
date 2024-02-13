import React from "react";
import { CompanyPricing } from "./CompanyPricing";
import { EnterpriseLicense } from "./EnterpriseLicense";
import { FreePricing2 } from "./FreePricing2";

export const Pricing: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <FreePricing2 />
      <CompanyPricing />
      <EnterpriseLicense />
    </div>
  );
};
