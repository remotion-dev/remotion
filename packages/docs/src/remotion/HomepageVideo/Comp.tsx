import React, { useCallback, useState } from "react";
import { AbsoluteFill } from "remotion";
import { Cards } from "./Card";

export const Comp: React.FC = () => {
  const [rerenders, setRerenders] = useState(0);

  const onUpdate = useCallback(() => {
    console.log("updated");
    setRerenders((i) => i + 1);
  }, []);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
      }}
    >
      <Cards key={rerenders} onUpdate={onUpdate} />
    </AbsoluteFill>
  );
};
