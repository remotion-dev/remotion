import { useState } from "react";
import React from "react";
import { PlayerExample } from "./PlayerExample";
import { inputStyle } from "./TextInput";

export const PlayerExampleWithControls: React.FC = () => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4098f5");
  return (
    <div>
      <PlayerExample name={name} color={color} />
      <p>
        Enter your name:{" "}
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            ...inputStyle,
          }}
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
