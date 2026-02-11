import React from "react";

export const InputContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="border border-unfocused-border-color p-geist rounded-geist bg-background flex flex-col">
      {children}
    </div>
  );
};
