import React from "react";

const recordCircle = (
  <svg xmlns="http://www.w3.org/2000/svg" height="10px" viewBox="0 0 512 512">
    <path fill="red" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
  </svg>
);

const buttonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  backgroundColor: "rgb(2, 8, 23)",
  border: "1px solid rgb(255, 255, 255, 0.1)",
  borderRadius: 6,
  padding: "1px 4px",
  width: 140,
  minWidth: 140,
  margin: "0px 4px",
  color: "white",
};

export const RecordingButton: React.FC<{ readonly type: "start" | "stop" }> = ({
  type,
}) => {
  return (
    <div style={buttonStyle}>
      {recordCircle} {type === "start" ? "Start recording" : "Stop recording"}{" "}
    </div>
  );
};
