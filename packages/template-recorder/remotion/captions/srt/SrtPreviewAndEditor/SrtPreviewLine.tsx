import React from "react";
import { UnserializedSrt } from "../helpers/serialize-srt";
import { SrtSingleCaption } from "./SingleCaption";

const container: React.CSSProperties = {
  justifyContent: "flex-end",
  alignItems: "center",
  position: "absolute",
  bottom: 0,
  width: "100%",
  display: "flex",
  flexDirection: "column",
};

const inner: React.CSSProperties = {
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  padding: "12px 15px",
  color: "white",
  fontFamily: "Helvetica, Arial, sans-serif",
  pointerEvents: "unset",
  borderRadius: 10,
  fontSize: 48,
  bottom: 50,
  position: "absolute",
};

export const SrtPreviewLine: React.FC<{
  segment: UnserializedSrt;
}> = ({ segment }) => {
  return (
    <div style={container}>
      <div style={inner}>
        {segment.captions.map((caption) => {
          return (
            <SrtSingleCaption
              caption={caption}
              key={caption.startMs}
            ></SrtSingleCaption>
          );
        })}
      </div>
    </div>
  );
};
