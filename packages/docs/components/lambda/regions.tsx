import { getRegions } from "@remotion/lambda/client";
import React from "react";

export const LambdaRegionList: React.FC = () => {
  return (
    <ul>
      {getRegions().map((region) => {
        return (
          <li key={region}>
            <code>{region}</code>{" "}
          </li>
        );
      })}
    </ul>
  );
};
