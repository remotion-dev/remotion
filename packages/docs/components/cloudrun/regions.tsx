import { GCP_REGIONS } from "@remotion/cloudrun/regions";
import React from "react";

export const GcpRegionList: React.FC = () => {
  return (
    <ul>
      {GCP_REGIONS.map((region) => {
        return (
          <li key={region}>
            <code>{region}</code>{" "}
          </li>
        );
      })}
    </ul>
  );
};
