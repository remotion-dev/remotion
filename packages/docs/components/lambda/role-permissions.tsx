import { getRolePolicy } from "@remotion/lambda/client";
import React from "react";

export const RolePolicy: React.FC = () => {
  return (
    <div>
      <pre>{getRolePolicy()}</pre>
    </div>
  );
};
