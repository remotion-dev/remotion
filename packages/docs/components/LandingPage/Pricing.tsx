import React from "react";
import { CompanyPricing } from "./CompanyPricing";
import { EnterpriseLicense } from "./EnterpriseLicense";
import { FreePricing } from "./FreePricing";

export const Pricing: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        marginBottom: 40,
      }}
    >
      <FreePricing />
      <CompanyPricing />
      <EnterpriseLicense />
    </div>
  );
};
