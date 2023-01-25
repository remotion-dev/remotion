import { getUserPolicy } from "@remotion/lambda/dist/api/iam-validation/suggested-policy";
import React from "react";

export const UserPolicy: React.FC = () => {
  return (
    <div>
      <pre>{getUserPolicy()}</pre>
    </div>
  );
};
