import React from "react";
import { Toggle } from "./components/ui/toggle";

export const ToggleCrop: React.FC<{
  onPressedChange: (pressed: boolean) => void;
  pressed: boolean;
}> = ({ onPressedChange, pressed }) => {
  return (
    <Toggle
      aria-label="Toggle italic"
      pressed={pressed}
      onPressedChange={onPressedChange}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: 16, height: 16 }}
        viewBox="0 0 512 512"
      >
        {/**
         * <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
         */}
        <path
          fill="currentcolor"
          d="M128 32c0-17.7-14.3-32-32-32S64 14.3 64 32V64H32C14.3 64 0 78.3 0 96s14.3 32 32 32H64V384c0 35.3 28.7 64 64 64H352V384H128V32zM384 480c0 17.7 14.3 32 32 32s32-14.3 32-32V448h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H448l0-256c0-35.3-28.7-64-64-64L160 64v64l224 0 0 352z"
        />
      </svg>
    </Toggle>
  );
};
