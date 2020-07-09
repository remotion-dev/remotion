import React from "react";
import { useFrame } from "@jonny/motion-core";

export const Hey = () => {
  const frame = useFrame();
  return (
    <div
      id="canvas"
      style={{
        width: 1080,
        height: 1080,
        display: "flex",
        background: "linear-gradient(to bottom, #7AFFB5, #36D27A)",
        padding: 50,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          backgroundColor: "white",
          boxShadow: "0 2px 2px gray",
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontFamily: "Montserrat",
            fontWeight: "bold",
          }}
        >
          {frame || "Hello !"}
        </div>
      </div>
    </div>
  );
};
