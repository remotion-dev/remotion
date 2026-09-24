import React from "react";

const outer: React.CSSProperties = {
  width: "100%",
  position: "absolute",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  fontSize: "0.9em",
  color: "#ddd",
};

export const PermissionError: React.FC = () => {
  return (
    <div style={outer}>
      This device does not seem to be able to capture both video and audio.
      <br /> Is there a camera and microphone connected?
    </div>
  );
};
