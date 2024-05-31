import React, { useState } from "react";
import { PlayerExample } from "./PlayerExample";
import { CoolInput } from "./TextInput";

export const PlayerExampleWithControls: React.FC = () => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4098f5");

  return (
    <div>
      <PlayerExample name={name} color={color} />
      <br />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div>Enter your name: </div>
        <div style={{ width: 8 }} />
        <CoolInput
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <br />
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
