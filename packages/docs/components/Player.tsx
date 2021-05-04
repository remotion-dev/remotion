import { Player } from "@remotion/player";
import React, { useState } from "react";
import { useCurrentFrame } from "remotion";
import { Main } from "./ColorDemo/Main";
import "./player.css";

const Comp: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{ fontSize: 200 }}>{frame}</div>;
};

export const PlayerExample: React.FC = () => {
  const [name, setName] = useState("");

  const [color, setColor] = useState("#4098f5");
  return (
    <div>
      <Player
        component={Main}
        compositionWidth={1280}
        compositionHeight={720}
        controls
        durationInFrames={350}
        fps={30}
        inputProps={{
          name,
          color,
        }}
        style={{
          aspectRatio: "16 / 9",
          height: undefined,
          width: "100%",
        }}
        loop
      ></Player>
      <br />
      <p>
        Enter your name:{" "}
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </p>
      <p>
        Select your favorite color:{" "}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </p>
    </div>
  );
};
