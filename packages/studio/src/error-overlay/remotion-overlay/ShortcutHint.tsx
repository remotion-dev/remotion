import React, { useMemo } from "react";
import { areKeyboardShortcutsDisabled } from "../../helpers/use-keybinding";

export const cmdOrCtrlCharacter = window.navigator.platform.startsWith("Mac")
  ? "⌘"
  : "Ctrl";

const container: React.CSSProperties = {
  display: "inline-block",
  marginLeft: 6,
  opacity: 0.6,
  verticalAlign: "middle",
};

export const ShortcutHint: React.FC<{
  keyToPress: string;
  cmdOrCtrl: boolean;
}> = ({ keyToPress, cmdOrCtrl }) => {
  const style = useMemo((): React.CSSProperties => {
    if (keyToPress === "↵") {
      return {
        display: "inline-block",
        transform: `translateY(2px)`,
      };
    }

    return {};
  }, [keyToPress]);
  if (areKeyboardShortcutsDisabled()) {
    return null;
  }

  return (
    <span style={container}>
      {cmdOrCtrl ? `${cmdOrCtrlCharacter}` : ""}
      <span style={style}>{keyToPress.toUpperCase()}</span>
    </span>
  );
};
