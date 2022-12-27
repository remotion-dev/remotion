import type { DetailedHTMLProps } from "react";
import React, { useCallback, useState } from "react";

const LIGHT_BLUE = "#42e9f5";
const DARK_BLUE = "#4290f5";

const inputStyle: React.CSSProperties = {
  padding: 16,
  border: "none",
  outline: "none",
  borderRadius: 4,
  minWidth: 35,
  fontSize: 16,
};

const backgroundStyle = (
  focused: boolean,
  fullWidth: boolean
): React.CSSProperties => {
  return {
    padding: 3,
    background: focused
      ? `linear-gradient(to right, ${LIGHT_BLUE}, ${DARK_BLUE})`
      : "rgba(0, 0, 0, 0.1)",
    display: fullWidth ? "block" : "inline-block",
    transition: "1s background-color",
    borderRadius: 7,
    overflow: "hidden",
  };
};

type Props = Omit<
  DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "onFocus" | "onBlur"
> & {
  fullWidth?: boolean;
};

export const CoolInput: React.FC<Props> = ({ style, fullWidth, ...props }) => {
  const [focus, setFocused] = useState(false);

  const onFocus = useCallback(() => {
    setFocused(true);
  }, [setFocused]);

  const onBlur = useCallback(() => {
    setFocused(false);
  }, [setFocused]);

  return (
    <div style={backgroundStyle(focus, fullWidth)}>
      <input
        style={{ ...inputStyle, ...style }}
        {...props}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
};
