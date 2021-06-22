import { Player } from "@remotion/player";
import React, { useState } from "react";
import { Main } from "./ColorDemo/Main";
import "./input-fields.css";

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
