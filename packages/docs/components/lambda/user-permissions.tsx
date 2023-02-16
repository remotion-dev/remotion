import { getUserPolicy } from "@remotion/lambda/client";
import React from "react";

export const UserPolicy: React.FC = () => {
  return (
    <div>
      <pre>{getUserPolicy()}</pre>
    </div>
  );
};
