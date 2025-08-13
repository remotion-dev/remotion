import React from "react";
import { useVideoConfig } from "remotion";
import {
  FIRST_COLUMN_WIDTH,
  HEADER_HEIGHT,
  SECOND_COLUMN_WIDTH,
  SIDE_PADDING,
} from "./layout";

const cmdOrCtrlCharacter = window.navigator.platform.startsWith("Mac")
  ? "⌘"
  : "Ctrl";

export const SubsEditorHeader: React.FC = () => {
  const { width } = useVideoConfig();
  const usableWidth = width - SIDE_PADDING * 2;

  return (
    <div
      style={{
        height: HEADER_HEIGHT,
        width: "100%",
        backgroundImage: "linear-gradient(white 60%, rgba(255, 255, 255, 0))",
        position: "absolute",
        paddingLeft: SIDE_PADDING,
        paddingRight: SIDE_PADDING,
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          fontFamily: "Helvetica",
          fontSize: 20,
          paddingTop: 30,
          color: "gray",
          textAlign: "right",
          paddingRight: 30,
          width: FIRST_COLUMN_WIDTH * usableWidth,
        }}
      >
        MILLISECONDS
      </div>
      <div
        style={{
          fontFamily: "Helvetica",
          fontSize: 20,
          paddingTop: 30,
          color: "gray",
          width: SECOND_COLUMN_WIDTH * usableWidth,
        }}
      >
        TEXT
      </div>
      <div
        style={{
          fontFamily: "Helvetica",
          fontSize: 20,
          paddingTop: 30,
          color: "gray",
        }}
      >
        MONOSPACE <kbd>({cmdOrCtrlCharacter}+I)</kbd>
      </div>
    </div>
  );
};
