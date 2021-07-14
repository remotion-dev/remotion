import { getRolePolicy } from "@remotion/lambda/dist/api/iam-validation/suggested-policy";
import React from "react";

export const RolePolicy: React.FC = () => {
  return (
    <div>
      <pre>{JSON.stringify(getRolePolicy(), null, 2)}</pre>
    </div>
  );
};
