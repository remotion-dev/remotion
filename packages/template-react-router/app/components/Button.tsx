import React, { forwardRef } from "react";
import { Spacing } from "./Spacing";
import { Spinner } from "./Spinner";
import { cn } from "~/lib/utils";

const ButtonForward: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    loading?: boolean;
    secondary?: boolean;
  }
> = ({ onClick, disabled, children, loading, secondary }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "border-foreground border rounded-geist bg-foreground text-background px-geist-half font-geist h-10 font-medium transition-all duration-150 ease-in-out inline-flex items-center appearance-none text-sm hover:bg-background hover:text-foreground hover:border-focused-border-color disabled:bg-button-disabled-color disabled:text-disabled-text-color disabled:border-unfocused-border-color disabled:cursor-not-allowed",
        secondary
          ? "bg-background text-foreground border-unfocused-border-color"
          : undefined,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {loading && (
        <>
          <Spinner size={20}></Spinner>
          <Spacing></Spacing>
        </>
      )}
      {children}
    </button>
  );
};

export const Button = forwardRef(ButtonForward);
