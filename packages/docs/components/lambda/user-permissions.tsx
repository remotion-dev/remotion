import { getUserPolicy } from "@remotion/lambda/dist/api/iam-validation/suggested-policy";
import React from "react";

export const LambdaRegionList: React.FC = () => {
  return (
    <div>
      <pre>{JSON.stringify(getUserPolicy(), null, 2)}</pre>
    </div>
  );
};
